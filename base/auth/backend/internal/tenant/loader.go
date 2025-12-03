package tenant

import (
	"fmt"
	"os"
)

// Loader はテナント設定を返す。
type Loader struct {
	cfg Config
}

// NewLoader はファイルパスを指定してテナント設定をロードする。
func NewLoader(path string) (*Loader, error) {
	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("read tenant config: %w", err)
	}
	cfg, err := Parse(data)
	if err != nil {
		return nil, err
	}
	return &Loader{cfg: cfg}, nil
}

// AuthConfig は指定テナントのauth設定を返す。
func (l *Loader) AuthConfig(tenantID string) (AuthTenant, bool) {
	ten, ok := l.cfg.Auth[tenantID]
	return ten, ok
}
