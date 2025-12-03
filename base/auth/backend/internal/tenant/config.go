package tenant

import (
	"fmt"
	"time"

	"gopkg.in/yaml.v3"
)

// Config はauth用のテナント設定全体。
type Config struct {
	Auth map[string]AuthTenant `yaml:"auth"`
}

// AuthTenant は1テナント分の設定。
type AuthTenant struct {
	AllowedOrigins        []string      `yaml:"allowedOrigins"`
	DefaultRedirectOrigin string        `yaml:"defaultRedirectOrigin"`
	RedirectPath          string        `yaml:"redirectPath"`
	Line                  LineConfig    `yaml:"line"`
	Twitter               TwitterConfig `yaml:"twitter"`
}

// LineConfig はテナントごとのLINE設定。
type LineConfig struct {
	ChannelID     string        `yaml:"channelID"`
	ChannelSecret string        `yaml:"channelSecret"`
	RedirectURI   string        `yaml:"redirectURI"`
	Scopes        []string      `yaml:"scopes"`
	StateSecret   string        `yaml:"stateSecret"`
	StateTTL      time.Duration `yaml:"stateTTL"`
	JWTSecret     string        `yaml:"jwtSecret"`
	JWTIssuer     string        `yaml:"jwtIssuer"`
	JWTAudience   string        `yaml:"jwtAudience"`
	JWTExpiresIn  time.Duration `yaml:"jwtExpiresIn"`
}

// TwitterConfig はテナントごとのTwitter設定。
type TwitterConfig struct {
	ClientID     string        `yaml:"clientID"`
	ClientSecret string        `yaml:"clientSecret"`
	RedirectURI  string        `yaml:"redirectURI"`
	Scopes       []string      `yaml:"scopes"`
	StateSecret  string        `yaml:"stateSecret"`
	StateTTL     time.Duration `yaml:"stateTTL"`
	JWTSecret    string        `yaml:"jwtSecret"`
	JWTIssuer    string        `yaml:"jwtIssuer"`
	JWTAudience  string        `yaml:"jwtAudience"`
	JWTExpiresIn time.Duration `yaml:"jwtExpiresIn"`
}

// Parse はYAMLバイト列からConfigを構築する。
func Parse(data []byte) (Config, error) {
	var cfg Config
	if err := yaml.Unmarshal(data, &cfg); err != nil {
		return Config{}, fmt.Errorf("parse tenant config: %w", err)
	}
	return cfg, nil
}
