package config

import (
	"errors"
	"os"
	"strconv"
	"strings"
	"time"
)

// Config はstorageサービス全体の設定を保持する。
type Config struct {
	HTTPAddr        string
	Endpoint        string
	AccessKeyID     string
	SecretAccessKey string
	Bucket          string
	PublicBaseURL   string
	MaxUploadBytes  int64
	AllowedTypes    []string
	HTTPTimeout     time.Duration
}

const (
	defaultHTTPAddr       = ":8080"
	defaultMaxUploadBytes = int64(10 * 1024 * 1024) // 10MB
)

// Load は環境変数から設定を読み込み、妥当性を検証する。
func Load() (Config, error) {
	cfg := Config{
		HTTPAddr:        getEnv("STORAGE_HTTP_ADDR", defaultHTTPAddr),
		Endpoint:        os.Getenv("STORAGE_ENDPOINT"),
		AccessKeyID:     os.Getenv("STORAGE_ACCESS_KEY_ID"),
		SecretAccessKey: os.Getenv("STORAGE_SECRET_ACCESS_KEY"),
		Bucket:          os.Getenv("STORAGE_BUCKET"),
		PublicBaseURL:   strings.TrimSuffix(os.Getenv("STORAGE_PUBLIC_BASE"), "/"),
		MaxUploadBytes:  defaultMaxUploadBytes,
		AllowedTypes:    parseList("STORAGE_ALLOWED_TYPES", []string{"image/"}),
		HTTPTimeout:     parseDuration("STORAGE_HTTP_TIMEOUT", 10*time.Second),
	}

	if v := strings.TrimSpace(os.Getenv("STORAGE_MAX_UPLOAD_BYTES")); v != "" {
		if parsed, err := strconv.ParseInt(v, 10, 64); err == nil && parsed > 0 {
			cfg.MaxUploadBytes = parsed
		}
	}

	if err := validate(cfg); err != nil {
		return Config{}, err
	}
	return cfg, nil
}

// validate は必須項目と値の範囲を確認する。
func validate(cfg Config) error {
	missing := []string{}
	if cfg.Endpoint == "" {
		missing = append(missing, "STORAGE_ENDPOINT")
	}
	if cfg.AccessKeyID == "" {
		missing = append(missing, "STORAGE_ACCESS_KEY_ID")
	}
	if cfg.SecretAccessKey == "" {
		missing = append(missing, "STORAGE_SECRET_ACCESS_KEY")
	}
	if cfg.Bucket == "" {
		missing = append(missing, "STORAGE_BUCKET")
	}
	if len(missing) > 0 {
		return ErrMissingEnv{Keys: missing}
	}
	if cfg.MaxUploadBytes <= 0 {
		return errors.New("STORAGE_MAX_UPLOAD_BYTES must be positive")
	}
	if cfg.HTTPTimeout <= 0 {
		return errors.New("STORAGE_HTTP_TIMEOUT must be positive")
	}
	return nil
}

// ErrMissingEnv は不足している環境変数のリストを持つエラー。
type ErrMissingEnv struct {
	Keys []string
}

// Error implements error.
func (e ErrMissingEnv) Error() string {
	return "missing required environment variables: " + strings.Join(e.Keys, ", ")
}

// getEnv は環境変数を取得し、空ならフォールバックを返す。
func getEnv(key string, fallback string) string {
	if v := strings.TrimSpace(os.Getenv(key)); v != "" {
		return v
	}
	return fallback
}

// parseList はカンマ区切りをスライスに変換する。
func parseList(key string, fallback []string) []string {
	raw := strings.TrimSpace(os.Getenv(key))
	if raw == "" {
		return fallback
	}
	parts := strings.Split(raw, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		if trimmed := strings.TrimSpace(p); trimmed != "" {
			out = append(out, trimmed)
		}
	}
	if len(out) == 0 {
		return fallback
	}
	return out
}

// parseDuration はduration文字列を解釈し、失敗時はフォールバックを返す。
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
