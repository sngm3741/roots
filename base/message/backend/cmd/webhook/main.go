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

	natsgo "github.com/nats-io/nats.go"

	"github.com/sngm3741/roots/base/message/internal/adapter/http/router"
	"github.com/sngm3741/roots/base/message/internal/config"
	natspub "github.com/sngm3741/roots/base/message/internal/infra/nats"
	"github.com/sngm3741/roots/base/message/internal/usecase/webhook"
)

func main() {
	cfg, err := config.LoadWebhook()
	if err != nil {
		log.Fatalf("config load error: %v", err)
	}

	nc, err := natsgo.Connect(cfg.NATS.URL, natsgo.MaxReconnects(0))
	if err != nil {
		log.Fatalf("failed to connect to NATS: %v", err)
	}
	defer nc.Drain()

	r := router.New()
	router.WithHealth(r)

	producer := natspub.NewProducer(nc)
	lineHandler := webhook.NewLineWebhookHandler(producer, cfg.Webhook.LineSubject, 1<<20, log.Printf)
	r.Mount("/line/webhook", lineHandler.Router())

	srv := &http.Server{
		Addr:    cfg.Webhook.HTTPAddr,
		Handler: r,
	}

	errChan := make(chan error, 1)
	go func() {
		log.Printf("Webhook server listening on %s", cfg.Webhook.HTTPAddr)
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
