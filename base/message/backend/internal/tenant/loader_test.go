package tenant

import (
	"os"
	"path/filepath"
	"testing"
	"time"
)

func TestValidateConfig_Succeeds(t *testing.T) {
	t.Parallel()
	cfg := Config{
		Message: map[string]MessageTenant{
			"sngm": {
				NATSURL:           "nats://nats:4222",
				DiscordSubject:    "discord.incoming.sngm",
				IngressTimeout:    5,
				WorkerHTTPTimeout: 5,
				Discord: DiscordConfig{
					WebhookURL: "https://discord.com/api/webhooks/xxx/yyy",
				},
			},
		},
	}
	if err := validateConfig(cfg); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
}

func TestValidateConfig_Errors(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name string
		cfg  Config
	}{
		{
			name: "no tenants",
			cfg:  Config{Message: map[string]MessageTenant{}},
		},
		{
			name: "no subjects",
			cfg: Config{Message: map[string]MessageTenant{
				"a": {NATSURL: "nats://nats:4222", IngressTimeout: 5, WorkerHTTPTimeout: 5},
			}},
		},
		{
			name: "line subject set but token missing",
			cfg: Config{Message: map[string]MessageTenant{
				"a": {
					NATSURL:           "nats://nats:4222",
					LineSubject:       "line.events.a",
					IngressTimeout:    5,
					WorkerHTTPTimeout: 5,
					Line: LineConfig{
						PushEndpoint: "",
						ChannelToken: "",
					},
				},
			}},
		},
		{
			name: "discord subject set but webhook missing",
			cfg: Config{Message: map[string]MessageTenant{
				"a": {
					NATSURL:           "nats://nats:4222",
					DiscordSubject:    "discord.incoming.a",
					IngressTimeout:    5,
					WorkerHTTPTimeout: 5,
				},
			}},
		},
		{
			name: "timeouts non-positive",
			cfg: Config{Message: map[string]MessageTenant{
				"a": {
					NATSURL:           "nats://nats:4222",
					DiscordSubject:    "discord.incoming.a",
					Discord:           DiscordConfig{WebhookURL: "https://discord.com/api/webhooks/x/y"},
					IngressTimeout:    0,
					WorkerHTTPTimeout: -1,
				},
			}},
		},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			if err := validateConfig(tt.cfg); err == nil {
				t.Fatalf("expected error")
			}
		})
	}
}

// ディレクトリ読み込みのマージ確認。
func TestLoadConfig_DirectoryMerge(t *testing.T) {
	t.Parallel()
	dir := t.TempDir()

	tenantA := `
message:
  a:
    natsURL: nats://nats:4222
    discordSubject: discord.in.a
    ingressTimeout: 5s
    workerHTTPTimeout: 5s
    discord:
      webhookURL: https://discord.com/api/webhooks/x/y
`
	tenantB := `
message:
  b:
    natsURL: nats://nats:4222
    lineSubject: line.events.b
    ingressTimeout: 5s
    workerHTTPTimeout: 5s
    line:
      pushEndpoint: https://api.line.me/v2/bot/message/push
      channelToken: tok
`
	if err := os.WriteFile(filepath.Join(dir, "a.yaml"), []byte(tenantA), 0o644); err != nil {
		t.Fatalf("write a: %v", err)
	}
	if err := os.WriteFile(filepath.Join(dir, "b.yaml"), []byte(tenantB), 0o644); err != nil {
		t.Fatalf("write b: %v", err)
	}

	cfg, err := loadConfig(dir)
	if err != nil {
		t.Fatalf("load config: %v", err)
	}
	if len(cfg.Message) != 2 {
		t.Fatalf("expected 2 tenants, got %d", len(cfg.Message))
	}
}

// 同一テナントキーが複数ファイルに存在する場合、後勝ちで上書きされることを確認。
func TestLoadConfig_DirectoryOverride(t *testing.T) {
	t.Parallel()
	dir := t.TempDir()

	first := `
message:
  dup:
    natsURL: nats://nats:4222
    discordSubject: discord.in.a
    ingressTimeout: 5s
    workerHTTPTimeout: 5s
    discord:
      webhookURL: https://discord.com/api/webhooks/x/old
`
	second := `
message:
  dup:
    natsURL: nats://nats:4222
    discordSubject: discord.in.b
    ingressTimeout: 10s
    workerHTTPTimeout: 10s
    discord:
      webhookURL: https://discord.com/api/webhooks/x/new
`

	if err := os.WriteFile(filepath.Join(dir, "01.yaml"), []byte(first), 0o644); err != nil {
		t.Fatalf("write first: %v", err)
	}
	if err := os.WriteFile(filepath.Join(dir, "02.yaml"), []byte(second), 0o644); err != nil {
		t.Fatalf("write second: %v", err)
	}

	cfg, err := loadConfig(dir)
	if err != nil {
		t.Fatalf("load config: %v", err)
	}
	dup, ok := cfg.Message["dup"]
	if !ok {
		t.Fatalf("dup not found")
	}
	if dup.DiscordSubject != "discord.in.b" || dup.IngressTimeout != 10*time.Second || dup.WorkerHTTPTimeout != 10*time.Second {
		t.Fatalf("expected override applied, got %+v", dup)
	}
	if dup.Discord.WebhookURL != "https://discord.com/api/webhooks/x/new" {
		t.Fatalf("webhook not overridden: %s", dup.Discord.WebhookURL)
	}
}
