package config

import (
	"errors"
	"os"
	"strings"
	"time"
)

// TwitterConfig はTwitter OAuth2で必要な設定をまとめた構造体。
type TwitterConfig struct {
	ClientID              string
	ClientSecret          string
	RedirectURI           string
	Scopes                []string
	StateSecret           []byte
	StateTTL              time.Duration
	AllowedOrigins        map[string]struct{}
	JWTSecret             []byte
	JWTIssuer             string
	JWTAudience           string
	JWTExpiresIn          time.Duration
	AuthorizeEndpoint     string
	TokenEndpoint         string
	ProfileEndpoint       string
	HTTPTimeout           time.Duration
	RedirectPath          string
	DefaultRedirectOrigin string
}

// LoadTwitter はTwitter向けの設定を環境変数から読み込む。
func LoadTwitter() (TwitterConfig, error) {
	cfg := TwitterConfig{
		ClientID:              strings.TrimSpace(os.Getenv("AUTH_TWITTER_CLIENT_ID")),
		ClientSecret:          strings.TrimSpace(os.Getenv("AUTH_TWITTER_CLIENT_SECRET")),
		RedirectURI:           strings.TrimSpace(os.Getenv("AUTH_TWITTER_REDIRECT_URI")),
		Scopes:                parseList("AUTH_TWITTER_SCOPES", []string{"tweet.read", "users.read", "offline.access"}),
		StateSecret:           []byte(strings.TrimSpace(os.Getenv("AUTH_TWITTER_STATE_SECRET"))),
		StateTTL:              parseDuration("AUTH_TWITTER_STATE_TTL", 10*time.Minute),
		AllowedOrigins:        parseOrigins("AUTH_TWITTER_ALLOWED_ORIGINS"),
		JWTSecret:             []byte(strings.TrimSpace(os.Getenv("AUTH_TWITTER_JWT_SECRET"))),
		JWTIssuer:             getEnvOrDefault("AUTH_TWITTER_JWT_ISSUER", "auth-twitter"),
		JWTAudience:           strings.TrimSpace(os.Getenv("AUTH_TWITTER_JWT_AUDIENCE")),
		JWTExpiresIn:          parseDuration("AUTH_TWITTER_JWT_EXPIRES_IN", 24*time.Hour),
		AuthorizeEndpoint:     getEnvOrDefault("AUTH_TWITTER_AUTHORIZE_ENDPOINT", "https://twitter.com/i/oauth2/authorize"),
		TokenEndpoint:         getEnvOrDefault("AUTH_TWITTER_TOKEN_ENDPOINT", "https://api.twitter.com/2/oauth2/token"),
		ProfileEndpoint:       getEnvOrDefault("AUTH_TWITTER_PROFILE_ENDPOINT", "https://api.twitter.com/2/users/me"),
		HTTPTimeout:           parseDuration("AUTH_TWITTER_HTTP_TIMEOUT", 10*time.Second),
		RedirectPath:          getEnvOrDefault("AUTH_TWITTER_REDIRECT_PATH", "/"),
		DefaultRedirectOrigin: strings.TrimSpace(os.Getenv("AUTH_TWITTER_DEFAULT_REDIRECT_ORIGIN")),
	}

	if err := validateTwitter(cfg); err != nil {
		return TwitterConfig{}, err
	}
	return cfg, nil
}

// validateTwitter は必須項目とタイムアウトなどの範囲を確認する。
func validateTwitter(cfg TwitterConfig) error {
	switch {
	case cfg.ClientID == "":
		return errors.New("AUTH_TWITTER_CLIENT_ID is required")
	case cfg.RedirectURI == "":
		return errors.New("AUTH_TWITTER_REDIRECT_URI is required")
	case len(cfg.StateSecret) == 0:
		return errors.New("AUTH_TWITTER_STATE_SECRET is required")
	case len(cfg.JWTSecret) == 0:
		return errors.New("AUTH_TWITTER_JWT_SECRET is required")
	case cfg.StateTTL <= 0:
		return errors.New("AUTH_TWITTER_STATE_TTL must be positive")
	case cfg.JWTExpiresIn <= 0:
		return errors.New("AUTH_TWITTER_JWT_EXPIRES_IN must be positive")
	case cfg.HTTPTimeout <= 0:
		return errors.New("AUTH_TWITTER_HTTP_TIMEOUT must be positive")
	}
	return nil
}
