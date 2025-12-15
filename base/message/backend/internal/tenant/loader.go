package tenant

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

// Loader はテナント設定を保持し、参照用APIを提供する。
type Loader struct {
	cfg Config
}

// NewLoader はファイルパスからテナント設定を読み込む。
func NewLoader(path string) (*Loader, error) {
	cfg, err := loadConfig(path)
	if err != nil {
		return nil, err
	}
	if err := validateConfig(cfg); err != nil {
		return nil, err
	}
	return &Loader{cfg: cfg}, nil
}

// MessageConfig はテナントIDに紐づく設定を返す。
func (l *Loader) MessageConfig(tenantID string) (MessageTenant, bool) {
	t, ok := l.cfg.Message[tenantID]
	return t, ok
}

// loadConfig はファイルまたはディレクトリから設定を読み込む。
func loadConfig(path string) (Config, error) {
	info, err := os.Stat(path)
	if err != nil {
		return Config{}, fmt.Errorf("stat tenant config: %w", err)
	}
	if !info.IsDir() {
		data, err := os.ReadFile(path)
		if err != nil {
			return Config{}, fmt.Errorf("read tenant config: %w", err)
		}
		return Parse(data)
	}

	var files []string
	err = filepath.WalkDir(path, func(p string, d os.DirEntry, walkErr error) error {
		if walkErr != nil {
			return walkErr
		}
		if d.IsDir() {
			return nil
		}
		if !isYAML(p) {
			return nil
		}
		files = append(files, p)
		return nil
	})
	if err != nil {
		return Config{}, err
	}

	sort.Strings(files)

	cfg := Config{Message: map[string]MessageTenant{}}
	for _, p := range files {
		data, err := os.ReadFile(p)
		if err != nil {
			return Config{}, fmt.Errorf("read tenant config %s: %w", p, err)
		}
		parsed, err := Parse(data)
		if err != nil {
			return Config{}, err
		}
		for k, v := range parsed.Message {
			cfg.Message[k] = v
		}
	}
	return cfg, nil
}

func isYAML(path string) bool {
	ext := strings.ToLower(filepath.Ext(path))
	return ext == ".yaml" || ext == ".yml"
}

// validateConfig はテナント設定の必須項目を検証する。
func validateConfig(cfg Config) error {
	if len(cfg.Message) == 0 {
		return fmt.Errorf("no message tenants defined")
	}
	for id, t := range cfg.Message {
		if err := validateTenant(id, t); err != nil {
			return err
		}
	}
	return nil
}

func validateTenant(id string, t MessageTenant) error {
	if strings.TrimSpace(t.NATSURL) == "" {
		return fmt.Errorf("tenant %s: natsURL is required", id)
	}
	lineUsed := strings.TrimSpace(t.LineSubject) != ""
	discordUsed := strings.TrimSpace(t.DiscordSubject) != ""
	if !lineUsed && !discordUsed {
		return fmt.Errorf("tenant %s: at least one subject (line/discord) is required", id)
	}
	if lineUsed {
		if strings.TrimSpace(t.Line.ChannelToken) == "" {
			return fmt.Errorf("tenant %s: line.channelToken is required when lineSubject is set", id)
		}
		if strings.TrimSpace(t.Line.PushEndpoint) == "" {
			return fmt.Errorf("tenant %s: line.pushEndpoint is required when lineSubject is set", id)
		}
	}
	if discordUsed {
		if strings.TrimSpace(t.Discord.WebhookURL) == "" {
			return fmt.Errorf("tenant %s: discord.webhookURL is required when discordSubject is set", id)
		}
	}
	if t.IngressTimeout <= 0 {
		return fmt.Errorf("tenant %s: ingressTimeout must be positive", id)
	}
	if t.WorkerHTTPTimeout <= 0 {
		return fmt.Errorf("tenant %s: workerHTTPTimeout must be positive", id)
	}
	return nil
}

// Tenants は全テナントの設定をコピーして返す。
func (l *Loader) Tenants() map[string]MessageTenant {
	out := make(map[string]MessageTenant, len(l.cfg.Message))
	for k, v := range l.cfg.Message {
		out[k] = v
	}
	return out
}
