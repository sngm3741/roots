package tenant

import (
	"fmt"
	"time"

	"gopkg.in/yaml.v3"
)

// Config はmessageサービス全体のテナント設定を表す。
type Config struct {
	Message map[string]MessageTenant `yaml:"message"`
}

// MessageTenant は1テナント分のメッセージ設定。
type MessageTenant struct {
	NATSURL            string        `yaml:"natsURL"`
	LineSubject        string        `yaml:"lineSubject"`
	DiscordSubject     string        `yaml:"discordSubject"`
	IngressTimeout     time.Duration `yaml:"ingressTimeout"`
	WorkerHTTPTimeout  time.Duration `yaml:"workerHTTPTimeout"`
	Line               LineConfig    `yaml:"line"`
	Discord            DiscordConfig `yaml:"discord"`
}

// LineConfig はLINE送信用の資格情報。
type LineConfig struct {
	PushEndpoint string `yaml:"pushEndpoint"`
	ChannelToken string `yaml:"channelToken"`
}

// DiscordConfig はDiscord送信用の資格情報。
type DiscordConfig struct {
	WebhookURL string `yaml:"webhookURL"`
	Username   string `yaml:"username"`
	AvatarURL  string `yaml:"avatarURL"`
}

// Parse はYAMLバイト列からテナント設定を構築する。
func Parse(data []byte) (Config, error) {
	var cfg Config
	if err := yaml.Unmarshal(data, &cfg); err != nil {
		return Config{}, fmt.Errorf("parse tenant config: %w", err)
	}
	return cfg, nil
}
