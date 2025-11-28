package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"

	"github.com/nats-io/nats.go"

	"github.com/sngm3741/roots/base/message/internal/config"
	"github.com/sngm3741/roots/base/message/internal/infra/discord"
	"github.com/sngm3741/roots/base/message/internal/infra/line"
	"github.com/sngm3741/roots/base/message/internal/usecase/worker"
)

func main() {
	cfg, err := config.LoadWorker()
	if err != nil {
		log.Fatalf("config load error: %v", err)
	}

	nc, err := nats.Connect(cfg.NATS.URL, nats.MaxReconnects(0))
	if err != nil {
		log.Fatalf("failed to connect to NATS: %v", err)
	}
	defer nc.Drain()

	lineClient := line.NewPusher(cfg.Line, cfg.Worker.HTTPTimeout)
	discordClient := discord.NewSender(cfg.Discord, cfg.Worker.HTTPTimeout)

	if err := worker.BuildLineWorker(cfg.Worker.LineSubject, nc, lineClient, log.Printf); err != nil {
		log.Fatalf("line worker init failed: %v", err)
	}
	if err := worker.BuildDiscordWorker(cfg.Worker.DiscordSubject, nc, discordClient, log.Printf); err != nil {
		log.Fatalf("discord worker init failed: %v", err)
	}

	wait()
}

func wait() {
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
	defer signal.Stop(sigChan)

	sig := <-sigChan
	log.Printf("signal received: %s, exiting", sig)
}
