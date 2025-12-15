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

	"github.com/sngm3741/roots/base/storage/internal/adapter/http/handler"
	"github.com/sngm3741/roots/base/storage/internal/config"
	"github.com/sngm3741/roots/base/storage/internal/infra/storage"
	"github.com/sngm3741/roots/base/storage/internal/usecase/upload"
)

// main はDIを行いHTTPサーバーを起動する。
func main() {
	cfg, err := config.Load()
	if err != nil {
		log.Fatalf("config load error: %v", err)
	}

	ctx := context.Background()
	uploader, err := storage.NewS3Uploader(ctx, cfg)
	if err != nil {
		log.Fatalf("failed to init storage: %v", err)
	}

	uc := upload.NewService(uploader, cfg.AllowedTypes, cfg.MaxUploadBytes)
	uploadHandler := handler.NewUploadHandler(uc, cfg.MaxUploadBytes)

	r := chi.NewRouter()
	r.Use(middleware.RequestID, middleware.RealIP, middleware.Recoverer, middleware.Timeout(30*time.Second))
	r.Mount("/", uploadHandler.Router())

	srv := &http.Server{
		Addr:              cfg.HTTPAddr,
		Handler:           r,
		ReadHeaderTimeout: 5 * time.Second,
	}

	errChan := make(chan error, 1)
	go func() {
		log.Printf("storage server listening on %s", cfg.HTTPAddr)
		errChan <- srv.ListenAndServe()
	}()

	waitForShutdown(srv, errChan, log.Printf)
}

func waitForShutdown(srv *http.Server, errChan <-chan error, logger func(format string, v ...any)) {
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
	defer signal.Stop(sigChan)

	select {
	case err := <-errChan:
		if err != nil && !errors.Is(err, http.ErrServerClosed) {
			logger("HTTP server error: %v", err)
		}
	case sig := <-sigChan:
		logger("signal received: %s, shutting down", sig)
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	_ = srv.Shutdown(ctx)
}
