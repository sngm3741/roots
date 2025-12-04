package config

import (
	"errors"
	"os"
	"strings"
	"time"
)

// NATSConfig はNATS接続に関する設定。
type NATSConfig struct {
	URL string
}

// WebhookConfig はWebhookサーバー側で使う設定。
type WebhookConfig struct {
	HTTPAddr string
	// subjects
	LineSubject    string
	DiscordSubject string
}

// WorkerConfig はワーカー側で使う設定。
type WorkerConfig struct {
	// subjects
	LineSubject    string
	DiscordSubject string
	HTTPTimeout    time.Duration
}

// IngressConfig は送信API側で使う設定。
type IngressConfig struct {
	HTTPAddr           string
	LineSubject        string
	DiscordSubject     string
	RequestTimeout     time.Duration
}

// LineConfig はLINE Messaging API送信用設定。
type LineConfig struct {
	PushEndpoint string
	ChannelToken string
}

// DiscordConfig はDiscord Webhook送信用設定。
type DiscordConfig struct {
	WebhookURL string
	Username   string
	AvatarURL  string
	// Allowed mentionsは空配列で固定する方針（乱暴なメンションを防ぐ）
}

// AppConfig はWebhook/Worker/Ingress共通の設定をまとめる。
type AppConfig struct {
	NATS    NATSConfig
	Webhook WebhookConfig
	Worker  WorkerConfig
	Ingress IngressConfig
	Line    LineConfig
	Discord DiscordConfig
}

// LoadWebhook はWebhookサーバー用の設定を読み込む。
func LoadWebhook() (AppConfig, error) {
	cfg := AppConfig{
		NATS: NATSConfig{
			URL: getEnv("NATS_URL", "nats://nats:4222"),
		},
		Webhook: WebhookConfig{
			HTTPAddr:       getEnv("MESSENGER_HTTP_ADDR", ":8080"),
			LineSubject:    getEnv("MESSENGER_LINE_EVENTS_SUBJECT", "line.events"),
			DiscordSubject: getEnv("MESSENGER_DISCORD_INCOMING_SUBJECT", "discord.incoming"),
		},
	}
	if err := validateWebhook(cfg); err != nil {
		return AppConfig{}, err
	}
	return cfg, nil
}

// LoadWorker はWorker用の設定を読み込む。
func LoadWorker() (AppConfig, error) {
	cfg := AppConfig{
		NATS: NATSConfig{
			URL: getEnv("NATS_URL", "nats://nats:4222"),
		},
		Worker: WorkerConfig{
			LineSubject:    getEnv("MESSENGER_LINE_EVENTS_SUBJECT", "line.events"),
			DiscordSubject: getEnv("MESSENGER_DISCORD_INCOMING_SUBJECT", "discord.incoming"),
			HTTPTimeout:    parseDuration("MESSENGER_WORKER_HTTP_TIMEOUT", 5*time.Second),
		},
		Line: LineConfig{
			PushEndpoint: getEnv("MESSENGER_LINE_PUSH_ENDPOINT", "https://api.line.me/v2/bot/message/push"),
			ChannelToken: strings.TrimSpace(os.Getenv("MESSENGER_LINE_CHANNEL_TOKEN")),
		},
		Discord: DiscordConfig{
			WebhookURL: strings.TrimSpace(os.Getenv("DISCORD_INCOMING_WEBHOOK_URL")),
			Username:   getEnv("DISCORD_INCOMING_USERNAME", "Makoto Club"),
			AvatarURL:  strings.TrimSpace(os.Getenv("DISCORD_INCOMING_AVATAR_URL")),
		},
	}
	if err := validateWorker(cfg); err != nil {
		return AppConfig{}, err
	}
	return cfg, nil
}

func validateWebhook(cfg AppConfig) error {
	if cfg.Webhook.HTTPAddr == "" {
		return errors.New("MESSENGER_HTTP_ADDR is required")
	}
	if cfg.Webhook.LineSubject == "" {
		return errors.New("MESSENGER_LINE_EVENTS_SUBJECT is required")
	}
	if cfg.Webhook.DiscordSubject == "" {
		return errors.New("MESSENGER_DISCORD_INCOMING_SUBJECT is required")
	}
	if cfg.NATS.URL == "" {
		return errors.New("NATS_URL is required")
	}
	return nil
}

func validateWorker(cfg AppConfig) error {
	if cfg.Worker.LineSubject == "" {
		return errors.New("MESSENGER_LINE_EVENTS_SUBJECT is required")
	}
	if cfg.Worker.DiscordSubject == "" {
		return errors.New("MESSENGER_DISCORD_INCOMING_SUBJECT is required")
	}
	if cfg.NATS.URL == "" {
		return errors.New("NATS_URL is required")
	}
	if cfg.Line.ChannelToken == "" {
		return errors.New("MESSENGER_LINE_CHANNEL_TOKEN is required")
	}
	if cfg.Line.PushEndpoint == "" {
		return errors.New("MESSENGER_LINE_PUSH_ENDPOINT is required")
	}
	if cfg.Discord.WebhookURL == "" {
		return errors.New("DISCORD_INCOMING_WEBHOOK_URL is required")
	}
	return nil
}

// LoadIngress は送信API用の設定を読み込む。
func LoadIngress() (AppConfig, error) {
	cfg := AppConfig{
		NATS: NATSConfig{
			URL: getEnv("NATS_URL", "nats://nats:4222"),
		},
		Ingress: IngressConfig{
			HTTPAddr:       getEnv("MESSENGER_HTTP_ADDR", ":8080"),
			LineSubject:    getEnv("MESSENGER_LINE_EVENTS_SUBJECT", "line.events"),
			DiscordSubject: getEnv("MESSENGER_DISCORD_INCOMING_SUBJECT", "discord.incoming"),
			RequestTimeout: parseDuration("MESSENGER_INGRESS_TIMEOUT", 5*time.Second),
		},
	}
	if err := validateIngress(cfg); err != nil {
		return AppConfig{}, err
	}
	return cfg, nil
}

func validateIngress(cfg AppConfig) error {
	if cfg.Ingress.HTTPAddr == "" {
		return errors.New("MESSENGER_HTTP_ADDR is required")
	}
	if cfg.Ingress.LineSubject == "" {
		return errors.New("MESSENGER_LINE_EVENTS_SUBJECT is required")
	}
	if cfg.Ingress.DiscordSubject == "" {
		return errors.New("MESSENGER_DISCORD_INCOMING_SUBJECT is required")
	}
	if cfg.NATS.URL == "" {
		return errors.New("NATS_URL is required")
	}
	return nil
}

func getEnv(key, fallback string) string {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		return v
	}
	return fallback
}

func parseDuration(key string, fallback time.Duration) time.Duration {
	raw := strings.TrimSpace(os.Getenv(key))
	if raw == "" {
		return fallback
	}
	d, err := time.ParseDuration(raw)
	if err != nil {
		return fallback
	}
	return d
}
