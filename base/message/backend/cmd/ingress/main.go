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
	natsgo "github.com/nats-io/nats.go"

	"github.com/sngm3741/roots/base/message/internal/adapter/http/handler"
	"github.com/sngm3741/roots/base/message/internal/config"
	natsinfra "github.com/sngm3741/roots/base/message/internal/infra/nats"
	"github.com/sngm3741/roots/base/message/internal/tenant"
	"github.com/sngm3741/roots/base/message/internal/usecase/ingress"
)

func main() {
	cfg, err := config.LoadIngressApp()
	if err != nil {
		log.Fatalf("config load error: %v", err)
	}

	loader, err := tenant.NewLoader(cfg.TenantConfigPath)
	if err != nil {
		log.Fatalf("tenant config load error: %v", err)
	}

	resolver := newIngressResolver(loader)
	defer resolver.Close()

	sendHandler := handler.NewSendHandler(resolver, cfg.DefaultRequestTTL)

	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Recoverer)
	r.Use(middleware.Timeout(cfg.HTTPTimeout))
	r.Use(middleware.RequestLogger(&middleware.DefaultLogFormatter{Logger: log.Default(), NoColor: true}))

	r.Get("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"status":"ok"}`))
	})

	r.Group(func(r chi.Router) {
		r.Use(handler.WithTenant)
		r.Mount("/", sendHandler.Router())
	})

	srv := &http.Server{
		Addr:              cfg.HTTPAddr,
		Handler:           r,
		ReadHeaderTimeout: 5 * time.Second,
	}

	errChan := make(chan error, 1)
	go func() {
		log.Printf("Ingress server listening on %s", cfg.HTTPAddr)
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

type ingressResolver struct {
	loader    *tenant.Loader
	services  sync.Map
	natsConns sync.Map // key: natsURL -> *nats.Conn
	dial      func(url string) (*natsgo.Conn, error)
}

func newIngressResolver(loader *tenant.Loader) *ingressResolver {
	return &ingressResolver{
		loader: loader,
		dial: func(url string) (*natsgo.Conn, error) {
			return natsgo.Connect(url, natsgo.MaxReconnects(0))
		},
	}
}

func (r *ingressResolver) ResolveIngress(tenantID string) (handler.IngressTenantDeps, error) {
	if v, ok := r.services.Load(tenantID); ok {
		return v.(handler.IngressTenantDeps), nil
	}

	cfg, ok := r.loader.MessageConfig(tenantID)
	if !ok {
		return handler.IngressTenantDeps{}, fmt.Errorf("tenant %s not found", tenantID)
	}
	if strings.TrimSpace(cfg.LineSubject) == "" && strings.TrimSpace(cfg.DiscordSubject) == "" {
		return handler.IngressTenantDeps{}, fmt.Errorf("tenant %s: subjects are empty", tenantID)
	}

	conn, err := r.natsConn(cfg.NATSURL)
	if err != nil {
		return handler.IngressTenantDeps{}, err
	}
	producer := natsinfra.NewProducer(conn)
	publisher := ingress.NewPublisherImpl(producer)
	service := ingress.NewService(publisher, ingress.Subjects{
		Line:    cfg.LineSubject,
		Discord: cfg.DiscordSubject,
	})

	deps := handler.IngressTenantDeps{
		Service: service,
		Timeout: cfg.IngressTimeout,
	}
	r.services.Store(tenantID, deps)
	return deps, nil
}

func (r *ingressResolver) natsConn(url string) (*natsgo.Conn, error) {
	if v, ok := r.natsConns.Load(url); ok {
		return v.(*natsgo.Conn), nil
	}
	connect := r.dial
	if connect == nil {
		connect = func(u string) (*natsgo.Conn, error) {
			return natsgo.Connect(u, natsgo.MaxReconnects(0))
		}
	}
	nc, err := connect(url)
	if err != nil {
		return nil, fmt.Errorf("connect nats: %w", err)
	}
	if actual, loaded := r.natsConns.LoadOrStore(url, nc); loaded {
		_ = nc.Drain()
		return actual.(*natsgo.Conn), nil
	}
	return nc, nil
}

func (r *ingressResolver) Close() {
	r.natsConns.Range(func(_ any, v any) bool {
		if nc, ok := v.(*natsgo.Conn); ok {
			_ = nc.Drain()
		}
		return true
	})
}
