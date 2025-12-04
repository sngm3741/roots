package main

import (
	"os"
	"path/filepath"
	"testing"

	natsgo "github.com/nats-io/nats.go"

	"github.com/sngm3741/roots/base/message/internal/tenant"
)

// webhookResolver のテーブル駆動テスト（LINE subject 有無の分岐）。
func TestWebhookResolver(t *testing.T) {
	t.Parallel()

	cfg := `message:
  hasLine:
    natsURL: nats://example:4222
    lineSubject: line.a
    discordSubject: discord.a
    line:
      pushEndpoint: https://api.line.me/v2/bot/message/push
      channelToken: tok
    ingressTimeout: 5s
    workerHTTPTimeout: 5s
    discord:
      webhookURL: https://example.invalid/webhook-a
  noLine:
    natsURL: nats://example:4222
    discordSubject: discord.b
    discord:
      webhookURL: https://example.invalid/webhook-b
    ingressTimeout: 5s
    workerHTTPTimeout: 5s
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
	resolver := newWebhookResolver(loader)
	// 実NATS接続を避けるダミーダイアル。
	resolver.dial = func(string) (*natsgo.Conn, error) {
		return &natsgo.Conn{}, nil
	}

	tests := []struct {
		name      string
		tenantID  string
		wantError bool
	}{
		{name: "line subject ok", tenantID: "hasLine"},
		{name: "line subject missing", tenantID: "noLine", wantError: true},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			_, err := resolver.ResolveLineWebhook(tt.tenantID)
			if tt.wantError && err == nil {
				t.Fatalf("want error, got nil")
			}
			if !tt.wantError && err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
		})
	}
}
