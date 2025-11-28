package main

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	httpadapter "github.com/sngm3741/roots/base/auth/internal/adapter/http"
	"github.com/sngm3741/roots/base/auth/internal/config"
	infraline "github.com/sngm3741/roots/base/auth/internal/infra/external/line"
	infratwitter "github.com/sngm3741/roots/base/auth/internal/infra/external/twitter"
	"github.com/sngm3741/roots/base/auth/internal/usecase/linelogin"
	"github.com/sngm3741/roots/base/auth/internal/usecase/twitterlogin"
)

// main はDIを行いHTTPサーバーを起動する。
func main() {
	lineCfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}
	twitterCfg, err := config.LoadTwitter()
	if err != nil {
		log.Fatalf("failed to load twitter config: %v", err)
	}

	logger := log.New(os.Stdout, "[auth-line] ", log.LstdFlags|log.Lmsgprefix)

	httpClient := &http.Client{
		Timeout: lineCfg.HTTPTimeout,
	}

	stateMgr := linelogin.NewHMACStateManager(lineCfg.StateSecret, lineCfg.StateTTL)
	tokenIssuer := linelogin.NewJWTIssuer(lineCfg.JWTSecret, lineCfg.JWTIssuer, lineCfg.JWTAudience, lineCfg.JWTExpiresIn)
	lineClient := infraline.NewClient(
		httpClient,
		lineCfg.ChannelID,
		lineCfg.ChannelSecret,
		lineCfg.RedirectURI,
		lineCfg.AuthorizeEndpoint,
		lineCfg.TokenEndpoint,
		lineCfg.ProfileEndpoint,
		lineCfg.BotPrompt,
		lineCfg.Scopes,
	)

	usecase := linelogin.NewUsecase(stateMgr, lineClient, tokenIssuer, lineCfg.AllowedOrigins, lineCfg.DefaultRedirectOrigin)
	handler := httpadapter.NewHandler(usecase, lineCfg.AllowedOrigins, lineCfg.DefaultRedirectOrigin, lineCfg.RedirectPath, lineCfg.HTTPTimeout, logger)

	twitterHTTPClient := &http.Client{
		Timeout: twitterCfg.HTTPTimeout,
	}
	twitterStateMgr := twitterlogin.NewHMACStateManager(twitterCfg.StateSecret, twitterCfg.StateTTL)
	twitterTokenIssuer := twitterlogin.NewJWTIssuer(twitterCfg.JWTSecret, twitterCfg.JWTIssuer, twitterCfg.JWTAudience, twitterCfg.JWTExpiresIn)
	twitterClient := infratwitter.NewClient(
		twitterHTTPClient,
		twitterCfg.ClientID,
		twitterCfg.ClientSecret,
		twitterCfg.RedirectURI,
		twitterCfg.AuthorizeEndpoint,
		twitterCfg.TokenEndpoint,
		twitterCfg.ProfileEndpoint,
		twitterCfg.Scopes,
	)
	twitterUsecase := twitterlogin.NewUsecase(twitterStateMgr, twitterClient, twitterTokenIssuer, twitterCfg.AllowedOrigins, twitterCfg.DefaultRedirectOrigin)
	twitterHandler := httpadapter.NewTwitterHandler(twitterUsecase, twitterCfg.AllowedOrigins, twitterCfg.DefaultRedirectOrigin, twitterCfg.RedirectPath, twitterCfg.HTTPTimeout, logger)

	router := chi.NewRouter()
	router.Use(middleware.RequestID)
	router.Use(middleware.RealIP)
	router.Use(middleware.Recoverer)
	router.Use(middleware.Timeout(30 * time.Second))
	router.Use(middleware.RequestLogger(&middleware.DefaultLogFormatter{
		Logger:  logger,
		NoColor: true,
	}))
	router.Get("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"status":"ok"}`))
	})
	handler.RegisterRoutes(router)
	twitterHandler.RegisterRoutes(router)

	httpServer := &http.Server{
		Addr:              lineCfg.HTTPAddr,
		Handler:           router,
		ReadHeaderTimeout: 5 * time.Second,
	}

	errChan := make(chan error, 1)
	go func() {
		logger.Printf("HTTP サーバーを %s で待ち受けます", lineCfg.HTTPAddr)
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
