package tenant

import (
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

// Loader はテナント設定を返す。
type Loader struct {
	cfg Config
}

// NewLoader はファイルパスを指定してテナント設定をロードする。
func NewLoader(path string) (*Loader, error) {
	cfg, err := loadConfig(path)
	if err != nil {
		return nil, err
	}
	if len(cfg.Auth) == 0 {
		return nil, fmt.Errorf("no auth tenants defined")
	}
	return &Loader{cfg: cfg}, nil
}

// AuthConfig は指定テナントのauth設定を返す。
func (l *Loader) AuthConfig(tenantID string) (AuthTenant, bool) {
	ten, ok := l.cfg.Auth[tenantID]
	return ten, ok
}

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

	cfg := Config{Auth: map[string]AuthTenant{}}
	for _, p := range files {
		data, err := os.ReadFile(p)
		if err != nil {
			return Config{}, fmt.Errorf("read tenant config %s: %w", p, err)
		}
		parsed, err := Parse(data)
		if err != nil {
			return Config{}, err
		}
		for k, v := range parsed.Auth {
			cfg.Auth[k] = v
		}
	}
	return cfg, nil
}

func isYAML(path string) bool {
	ext := strings.ToLower(filepath.Ext(path))
	return ext == ".yaml" || ext == ".yml"
}
