package tenant

import (
	"fmt"
	"os"
)

// Loader はテナント設定を保持し、参照用APIを提供する。
type Loader struct {
	cfg Config
}

// NewLoader はファイルパスからテナント設定を読み込む。
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

// MessageConfig はテナントIDに紐づく設定を返す。
func (l *Loader) MessageConfig(tenantID string) (MessageTenant, bool) {
	t, ok := l.cfg.Message[tenantID]
	return t, ok
}

// Tenants は全テナントの設定をコピーして返す。
func (l *Loader) Tenants() map[string]MessageTenant {
	out := make(map[string]MessageTenant, len(l.cfg.Message))
	for k, v := range l.cfg.Message {
		out[k] = v
	}
	return out
}
