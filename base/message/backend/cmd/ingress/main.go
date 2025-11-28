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

	"github.com/sngm3741/roots/base/message/internal/adapter/http/handler"
	"github.com/sngm3741/roots/base/message/internal/adapter/http/router"
	"github.com/sngm3741/roots/base/message/internal/config"
	"github.com/sngm3741/roots/base/message/internal/infra/nats"
	"github.com/sngm3741/roots/base/message/internal/usecase/ingress"
)

func main() {
	cfg, err := config.LoadIngress()
	if err != nil {
		log.Fatalf("config load error: %v", err)
	}

	nc, err := natsgo.Connect(cfg.NATS.URL, natsgo.MaxReconnects(0))
	if err != nil {
		log.Fatalf("failed to connect to NATS: %v", err)
	}
	defer nc.Drain()

	producer := nats.NewProducer(nc)
	publisher := ingress.NewPublisherImpl(producer)
	service := ingress.NewService(publisher, ingress.Subjects{
		Line:    cfg.Ingress.LineSubject,
		Discord: cfg.Ingress.DiscordSubject,
	}, cfg.Ingress.DefaultDestination)
	sendHandler := handler.NewSendHandler(service, cfg.Ingress.RequestTimeout)

	r := router.New()
	router.WithHealth(r)
	r.Mount("/", sendHandler.Router())

	srv := &http.Server{
		Addr:              cfg.Ingress.HTTPAddr,
		Handler:           r,
		ReadHeaderTimeout: 5 * time.Second,
	}

	errChan := make(chan error, 1)
	go func() {
		log.Printf("Ingress server listening on %s", cfg.Ingress.HTTPAddr)
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
