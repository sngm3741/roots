package main

import (
	"context"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"strings"
	"sync"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	httpadapter "github.com/sngm3741/roots/base/auth/internal/adapter/http/handler"
	"github.com/sngm3741/roots/base/auth/internal/config"
	infraline "github.com/sngm3741/roots/base/auth/internal/infra/external/line"
	infratwitter "github.com/sngm3741/roots/base/auth/internal/infra/external/twitter"
	"github.com/sngm3741/roots/base/auth/internal/tenant"
	"github.com/sngm3741/roots/base/auth/internal/usecase/linelogin"
	"github.com/sngm3741/roots/base/auth/internal/usecase/twitterlogin"
)

const (
	lineAuthorizeEndpoint    = "https://access.line.me/oauth2/v2.1/authorize"
	lineTokenEndpoint        = "https://api.line.me/oauth2/v2.1/token"
	lineProfileEndpoint      = "https://api.line.me/v2/profile"
	defaultLineBotPrompt     = ""
	twitterAuthorizeEndpoint = "https://twitter.com/i/oauth2/authorize"
	twitterTokenEndpoint     = "https://api.twitter.com/2/oauth2/token"
	twitterProfileEndpoint   = "https://api.twitter.com/2/users/me"
)

// main はDIを行いHTTPサーバーを起動する。
func main() {
	appCfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	loader, err := tenant.NewLoader(appCfg.TenantConfigPath)
	if err != nil {
		log.Fatalf("failed to load tenant config: %v", err)
	}

	logger := log.New(os.Stdout, "[auth] ", log.LstdFlags|log.Lmsgprefix)

	httpClient := &http.Client{
		Timeout: appCfg.HTTPTimeout,
	}

	resolver := newTenantResolver(loader, httpClient, logger.Printf)
	lineHandler := httpadapter.NewLineHandler(resolver, appCfg.HTTPTimeout, logger)
	twitterHandler := httpadapter.NewTwitterHandler(resolver, appCfg.HTTPTimeout, logger)

	router := chi.NewRouter()
	router.Use(middleware.RequestID)
	router.Use(middleware.RealIP)
	router.Use(middleware.Recoverer)
	router.Use(middleware.Timeout(appCfg.HTTPTimeout))
	router.Use(middleware.RequestLogger(&middleware.DefaultLogFormatter{
		Logger:  logger,
		NoColor: true,
	}))
	router.Get("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"status":"ok"}`))
	})
	router.Group(func(r chi.Router) {
		r.Use(httpadapter.WithTenant)
		lineHandler.RegisterLineRoutes(r)
		twitterHandler.RegisterRoutes(r)
	})

	httpServer := &http.Server{
		Addr:              appCfg.HTTPAddr,
		Handler:           router,
		ReadHeaderTimeout: 5 * time.Second,
	}

	errChan := make(chan error, 1)
	go func() {
		logger.Printf("HTTP サーバーを %s で待ち受けます", appCfg.HTTPAddr)
		errChan <- httpServer.ListenAndServe()
	}()

	waitForShutdown(httpServer, errChan, logger)
}

// waitForShutdown はSIGINT/SIGTERMを待ち、HTTPサーバーを安全に停止する。
func waitForShutdown(httpServer *http.Server, errChan <-chan error, logger *log.Logger) {
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
	defer signal.Stop(sigChan)

	select {
	case err := <-errChan:
		if err != nil && !errors.Is(err, http.ErrServerClosed) {
			logger.Fatalf("HTTP サーバーが異常終了しました: %v", err)
		}
	case sig := <-sigChan:
		logger.Printf("シグナル %s を受信しました。シャットダウンを開始します。", sig)
	}

	shutdownCtx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := httpServer.Shutdown(shutdownCtx); err != nil {
		logger.Printf("HTTP サーバーのシャットダウンに失敗しました: %v", err)
	}
	logger.Println("シャットダウンが完了しました。")
}

type tenantResolver struct {
	loader          *tenant.Loader
	httpClient      *http.Client
	lineCache       sync.Map
	twitterCache    sync.Map
	logf            func(string, ...any)
	lineDisabled    sync.Map
	twitterDisabled sync.Map
}

func newTenantResolver(loader *tenant.Loader, httpClient *http.Client, logf func(string, ...any)) *tenantResolver {
	return &tenantResolver{
		loader:     loader,
		httpClient: httpClient,
		logf:       logf,
	}
}

func (r *tenantResolver) ResolveLine(tenantID string) (httpadapter.LineTenantDeps, error) {
	if v, ok := r.lineCache.Load(tenantID); ok {
		return v.(httpadapter.LineTenantDeps), nil
	}

	cfg, ok := r.loader.AuthConfig(tenantID)
	if !ok {
		return httpadapter.LineTenantDeps{}, fmt.Errorf("tenant %s not found", tenantID)
	}

	lineCfg := cfg.Line
	if lineCfg.ChannelID == "" || lineCfg.ChannelSecret == "" || lineCfg.RedirectURI == "" {
		if _, logged := r.lineDisabled.LoadOrStore(tenantID, struct{}{}); !logged && r.logf != nil {
			r.logf("tenant %s: LINE auth disabled (missing credentials)", tenantID)
		}
		return httpadapter.LineTenantDeps{}, httpadapter.ErrLineDisabled
	}

	allowed := toSet(cfg.AllowedOrigins)
	stateMgr := linelogin.NewHMACStateManager([]byte(lineCfg.StateSecret), lineCfg.StateTTL)
	tokenIssuer := linelogin.NewJWTIssuer([]byte(lineCfg.JWTSecret), lineCfg.JWTIssuer, lineCfg.JWTAudience, lineCfg.JWTExpiresIn)
	lineClient := infraline.NewClient(
		r.httpClient,
		lineCfg.ChannelID,
		lineCfg.ChannelSecret,
		lineCfg.RedirectURI,
		lineAuthorizeEndpoint,
		lineTokenEndpoint,
		lineProfileEndpoint,
		defaultLineBotPrompt,
		lineCfg.Scopes,
	)

	usecase := linelogin.NewUsecase(stateMgr, lineClient, tokenIssuer, allowed, cfg.DefaultRedirectOrigin)
	deps := httpadapter.LineTenantDeps{
		Usecase:               usecase,
		AllowedOrigins:        allowed,
		DefaultRedirectOrigin: cfg.DefaultRedirectOrigin,
		RedirectPath:          cfg.RedirectPath,
	}
	r.lineCache.Store(tenantID, deps)
	return deps, nil
}

func (r *tenantResolver) ResolveTwitter(tenantID string) (httpadapter.TwitterTenantDeps, error) {
	if v, ok := r.twitterCache.Load(tenantID); ok {
		return v.(httpadapter.TwitterTenantDeps), nil
	}

	cfg, ok := r.loader.AuthConfig(tenantID)
	if !ok {
		return httpadapter.TwitterTenantDeps{}, fmt.Errorf("tenant %s not found", tenantID)
	}

	tw := cfg.Twitter
	if tw.ClientID == "" || tw.RedirectURI == "" {
		if _, logged := r.twitterDisabled.LoadOrStore(tenantID, struct{}{}); !logged && r.logf != nil {
			r.logf("tenant %s: Twitter auth disabled (missing credentials)", tenantID)
		}
		return httpadapter.TwitterTenantDeps{}, httpadapter.ErrTwitterDisabled
	}

	allowed := toSet(cfg.AllowedOrigins)
	stateMgr := twitterlogin.NewHMACStateManager([]byte(tw.StateSecret), tw.StateTTL)
	tokenIssuer := twitterlogin.NewJWTIssuer([]byte(tw.JWTSecret), tw.JWTIssuer, tw.JWTAudience, tw.JWTExpiresIn)
	twitterClient := infratwitter.NewClient(
		r.httpClient,
		tw.ClientID,
		tw.ClientSecret,
		tw.RedirectURI,
		twitterAuthorizeEndpoint,
		twitterTokenEndpoint,
		twitterProfileEndpoint,
		tw.Scopes,
	)
	usecase := twitterlogin.NewUsecase(stateMgr, twitterClient, tokenIssuer, allowed, cfg.DefaultRedirectOrigin)
	deps := httpadapter.TwitterTenantDeps{
		Usecase:               usecase,
		AllowedOrigins:        allowed,
		DefaultRedirectOrigin: cfg.DefaultRedirectOrigin,
		RedirectPath:          cfg.RedirectPath,
	}
	r.twitterCache.Store(tenantID, deps)
	return deps, nil
}

func toSet(values []string) map[string]struct{} {
	set := make(map[string]struct{}, len(values))
	for _, v := range values {
		val := strings.TrimSpace(v)
		if val == "" {
			continue
		}
		set[val] = struct{}{}
	}
	return set
}
