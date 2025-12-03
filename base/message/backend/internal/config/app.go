package config

import (
	"errors"
	"os"
	"strconv"
	"strings"
	"time"
)

// IngressAppConfig は送信APIのプロセス設定。
type IngressAppConfig struct {
	HTTPAddr          string
	HTTPTimeout       time.Duration
	TenantConfigPath  string
	DefaultRequestTTL time.Duration
}

// WebhookAppConfig はLINE Webhookプロセスの設定。
type WebhookAppConfig struct {
	HTTPAddr         string
	HTTPTimeout      time.Duration
	MaxBodyBytes     int64
	TenantConfigPath string
}

// WorkerAppConfig はワーカープロセスの設定。
type WorkerAppConfig struct {
	TenantConfigPath string
}

const (
	defaultHTTPTimeout = 30 * time.Second
	defaultMaxBody     = int64(1 << 20)
)

// LoadIngressApp はIngressプロセスの設定をロードする。
func LoadIngressApp() (IngressAppConfig, error) {
	cfg := IngressAppConfig{
		HTTPAddr:          getEnvVal("MESSAGE_INGRESS_HTTP_ADDR", ":8080"),
		HTTPTimeout:       parseDurationVal("MESSAGE_HTTP_TIMEOUT", defaultHTTPTimeout),
		DefaultRequestTTL: parseDurationVal("MESSAGE_INGRESS_TIMEOUT", 5*time.Second),
		TenantConfigPath:  strings.TrimSpace(os.Getenv("MESSAGE_TENANT_CONFIG_PATH")),
	}
	if cfg.TenantConfigPath == "" {
		return IngressAppConfig{}, errors.New("MESSAGE_TENANT_CONFIG_PATH is required")
	}
	return cfg, nil
}

// LoadWebhookApp はWebhookプロセスの設定をロードする。
func LoadWebhookApp() (WebhookAppConfig, error) {
	cfg := WebhookAppConfig{
		HTTPAddr:         getEnvVal("MESSAGE_WEBHOOK_HTTP_ADDR", ":8080"),
		HTTPTimeout:      parseDurationVal("MESSAGE_HTTP_TIMEOUT", defaultHTTPTimeout),
		MaxBodyBytes:     parseInt64Val("MESSAGE_WEBHOOK_MAX_BODY", defaultMaxBody),
		TenantConfigPath: strings.TrimSpace(os.Getenv("MESSAGE_TENANT_CONFIG_PATH")),
	}
	if cfg.TenantConfigPath == "" {
		return WebhookAppConfig{}, errors.New("MESSAGE_TENANT_CONFIG_PATH is required")
	}
	return cfg, nil
}

// LoadWorkerApp はWorkerプロセスの設定をロードする。
func LoadWorkerApp() (WorkerAppConfig, error) {
	cfg := WorkerAppConfig{
		TenantConfigPath: strings.TrimSpace(os.Getenv("MESSAGE_TENANT_CONFIG_PATH")),
	}
	if cfg.TenantConfigPath == "" {
		return WorkerAppConfig{}, errors.New("MESSAGE_TENANT_CONFIG_PATH is required")
	}
	return cfg, nil
}

func getEnvVal(key, fallback string) string {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		return v
	}
	return fallback
}

func parseDurationVal(key string, fallback time.Duration) time.Duration {
	raw := strings.TrimSpace(os.Getenv(key))
	if raw == "" {
		return fallback
	}
	if d, err := time.ParseDuration(raw); err == nil {
		return d
	}
	return fallback
}

func parseInt64Val(key string, fallback int64) int64 {
	raw := strings.TrimSpace(os.Getenv(key))
	if raw == "" {
		return fallback
	}
	val, err := strconv.ParseInt(raw, 10, 64)
	if err == nil {
		return val
	}
	return fallback
}
