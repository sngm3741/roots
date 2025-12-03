package main

import (
	"os"
	"path/filepath"
	"testing"
	"time"

	natsgo "github.com/nats-io/nats.go"

	"github.com/sngm3741/roots/base/message/internal/tenant"
)

// ingressResolver のテーブル駆動テスト（LINEのみ／Discordのみ／両方空の分岐）。
func TestIngressResolver(t *testing.T) {
	t.Parallel()

	cfg := `message:
  both:
    natsURL: nats://example:4222
    lineSubject: line.a
    discordSubject: discord.a
    line:
      pushEndpoint: https://api.line.me/v2/bot/message/push
      channelToken: tok
    discord:
      webhookURL: https://discord.com/api/webhooks/x/y
      username: bot
      avatarURL: ""
    defaultDestination: line
    ingressTimeout: 5s
  discordOnly:
    natsURL: nats://example:4222
    discordSubject: discord.only
    discord:
      webhookURL: https://discord.com/api/webhooks/x/z
      username: bot
      avatarURL: ""
    defaultDestination: discord
    ingressTimeout: 5s
  empty:
    natsURL: nats://example:4222
    defaultDestination: line
`
	dir := t.TempDir()
	path := filepath.Join(dir, "tenants.yaml")
	if err := os.WriteFile(path, []byte(cfg), 0o644); err != nil {
		t.Fatalf("write cfg: %v", err)
	}
	loader, err := tenant.NewLoader(path)
	if err != nil {
		t.Fatalf("loader: %v", err)
	}
	resolver := newIngressResolver(loader)
	// テストでは実接続しないダミーダイアルを差し込む。
	resolver.dial = func(string) (*natsgo.Conn, error) {
		return &natsgo.Conn{}, nil
	}

	tests := []struct {
		name      string
		tenantID  string
		wantError bool
	}{
		{name: "line+discord OK", tenantID: "both"},
		{name: "discord only OK", tenantID: "discordOnly"},
		{name: "subjects empty error", tenantID: "empty", wantError: true},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			deps, err := resolver.ResolveIngress(tt.tenantID)
			if tt.wantError {
				if err == nil {
					t.Fatalf("want error, got nil")
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if deps.Timeout <= 0 {
				t.Fatalf("timeout should be positive")
			}
		})
	}
}

func TestIngressResolver_Close(t *testing.T) {
	t.Parallel()
	cfg := `message: {}` // empty but valid YAML for close path
	dir := t.TempDir()
	path := filepath.Join(dir, "t.yaml")
	if err := os.WriteFile(path, []byte(cfg), 0o644); err != nil {
		t.Fatalf("write cfg: %v", err)
	}
	loader, err := tenant.NewLoader(path)
	if err != nil {
		t.Fatalf("loader: %v", err)
	}
	resolver := newIngressResolver(loader)
	resolver.Close() // should not panic
	time.Sleep(10 * time.Millisecond)
}
