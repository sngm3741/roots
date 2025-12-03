package config

import (
	"errors"
	"os"
	"strings"
	"time"
)

// AppConfig はサーバー共通設定とテナント設定ファイルパスを保持する。
type AppConfig struct {
	HTTPAddr        string
	HTTPTimeout     time.Duration
	TenantConfigPath string
}

const (
	defaultHTTPAddr    = ":8080"
	defaultHTTPTimeout = 30 * time.Second
)

// Load は環境変数から設定を読み込む。
// 必須: AUTH_TENANT_CONFIG_PATH
func Load() (AppConfig, error) {
	cfg := AppConfig{
		HTTPAddr:        getEnv("AUTH_HTTP_ADDR", defaultHTTPAddr),
		HTTPTimeout:     parseDuration("AUTH_HTTP_TIMEOUT", defaultHTTPTimeout),
		TenantConfigPath: strings.TrimSpace(os.Getenv("AUTH_TENANT_CONFIG_PATH")),
	}
	if cfg.TenantConfigPath == "" {
		return AppConfig{}, errors.New("AUTH_TENANT_CONFIG_PATH is required")
	}
	if cfg.HTTPTimeout <= 0 {
		return AppConfig{}, errors.New("AUTH_HTTP_TIMEOUT must be positive")
	}
	return cfg, nil
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
	if d, err := time.ParseDuration(raw); err == nil {
		return d
	}
	return fallback
}
