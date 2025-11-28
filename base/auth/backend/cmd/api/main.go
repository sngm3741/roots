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

	httpadapter "github.com/sngm3741/roots/base/auth/internal/adapter/http"
	"github.com/sngm3741/roots/base/auth/internal/config"
	infraline "github.com/sngm3741/roots/base/auth/internal/infra/external/line"
	"github.com/sngm3741/roots/base/auth/internal/usecase/linelogin"
)

// main はDIを行いHTTPサーバーを起動する。
func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	logger := log.New(os.Stdout, "[auth-line] ", log.LstdFlags|log.Lmsgprefix)

	httpClient := &http.Client{
		Timeout: cfg.HTTPTimeout,
	}

	stateMgr := linelogin.NewHMACStateManager(cfg.StateSecret, cfg.StateTTL)
	tokenIssuer := linelogin.NewJWTIssuer(cfg.JWTSecret, cfg.JWTIssuer, cfg.JWTAudience, cfg.JWTExpiresIn)
	lineClient := infraline.NewClient(
		httpClient,
		cfg.ChannelID,
		cfg.ChannelSecret,
		cfg.RedirectURI,
		cfg.AuthorizeEndpoint,
		cfg.TokenEndpoint,
		cfg.ProfileEndpoint,
		cfg.BotPrompt,
		cfg.Scopes,
	)

	usecase := linelogin.NewUsecase(stateMgr, lineClient, tokenIssuer, cfg.AllowedOrigins, cfg.DefaultRedirectOrigin)
	handler := httpadapter.NewHandler(usecase, cfg.AllowedOrigins, cfg.DefaultRedirectOrigin, cfg.RedirectPath, cfg.HTTPTimeout, logger)

	httpServer := &http.Server{
		Addr:              cfg.HTTPAddr,
		Handler:           handler.Routes(),
		ReadHeaderTimeout: 5 * time.Second,
	}

	errChan := make(chan error, 1)
	go func() {
		logger.Printf("HTTP サーバーを %s で待ち受けます", cfg.HTTPAddr)
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
