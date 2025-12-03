package main

import (
	"fmt"
	"log"
	"os"
	"os/signal"
	"sync"
	"syscall"
	"time"

	natsgo "github.com/nats-io/nats.go"

	"github.com/sngm3741/roots/base/message/internal/config"
	"github.com/sngm3741/roots/base/message/internal/infra/discord"
	"github.com/sngm3741/roots/base/message/internal/infra/line"
	"github.com/sngm3741/roots/base/message/internal/tenant"
	"github.com/sngm3741/roots/base/message/internal/usecase/worker"
)

func main() {
	appCfg, err := config.LoadWorkerApp()
	if err != nil {
		log.Fatalf("config load error: %v", err)
	}

	loader, err := tenant.NewLoader(appCfg.TenantConfigPath)
	if err != nil {
		log.Fatalf("tenant config load error: %v", err)
	}

	connPool := newNATSConnPool()
	defer connPool.Close()

	tenants := loader.Tenants()
	for tenantID, cfg := range tenants {
		if err := setupTenantWorkers(tenantID, cfg, connPool); err != nil {
			log.Fatalf("tenant %s worker init failed: %v", tenantID, err)
		}
		log.Printf("tenant %s workers started", tenantID)
	}

	wait()
}

func setupTenantWorkers(tenantID string, cfg tenant.MessageTenant, pool *natsConnPool) error {
	if cfg.NATSURL == "" {
		return fmt.Errorf("nats url empty")
	}
	nc, err := pool.Conn(cfg.NATSURL)
	if err != nil {
		return err
	}

	timeout := cfg.WorkerHTTPTimeout
	if timeout <= 0 {
		timeout = 5 * time.Second
	}

	if cfg.LineSubject != "" {
		lineClient := line.NewPusher(cfg.Line.PushEndpoint, cfg.Line.ChannelToken, timeout)
		if err := worker.BuildLineWorker(cfg.LineSubject, nc, lineClient, log.Printf); err != nil {
			return fmt.Errorf("line worker: %w", err)
		}
	}
	if cfg.DiscordSubject != "" {
		discordClient := discord.NewSender(cfg.Discord.WebhookURL, cfg.Discord.Username, cfg.Discord.AvatarURL, timeout)
		if err := worker.BuildDiscordWorker(cfg.DiscordSubject, nc, discordClient, log.Printf); err != nil {
			return fmt.Errorf("discord worker: %w", err)
		}
	}
	return nil
}

func wait() {
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
	defer signal.Stop(sigChan)

	sig := <-sigChan
	log.Printf("signal received: %s, exiting", sig)
}

type natsConnPool struct {
	conns sync.Map
}

func newNATSConnPool() *natsConnPool {
	return &natsConnPool{}
}

func (p *natsConnPool) Conn(url string) (*natsgo.Conn, error) {
	if v, ok := p.conns.Load(url); ok {
		return v.(*natsgo.Conn), nil
	}
	nc, err := natsgo.Connect(url, natsgo.MaxReconnects(0))
	if err != nil {
		return nil, err
	}
	if actual, loaded := p.conns.LoadOrStore(url, nc); loaded {
		_ = nc.Drain()
		return actual.(*natsgo.Conn), nil
	}
	return nc, nil
}

func (p *natsConnPool) Close() {
	p.conns.Range(func(_, v any) bool {
		if nc, ok := v.(*natsgo.Conn); ok {
			_ = nc.Drain()
		}
		return true
	})
}
