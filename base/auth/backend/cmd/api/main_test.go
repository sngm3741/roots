package main

import (
	"net/http"
	"os"
	"path/filepath"
	"testing"
	"time"

	"github.com/sngm3741/roots/base/auth/internal/tenant"
)

// テナントリゾルバのテーブル駆動テスト（Line/Twitter有効・無効の分岐）。
func TestTenantResolver(t *testing.T) {
	t.Parallel()

	cfg := `auth:
  tenantLineOnly:
    allowedOrigins: ["https://app.example.com"]
    defaultRedirectOrigin: https://app.example.com
    redirectPath: /auth/result
    line:
      channelID: cid
      channelSecret: csec
      redirectURI: https://app.example.com/cb
      scopes: ["profile"]
      stateSecret: sss
      stateTTL: 10m
      jwtSecret: jjj
      jwtIssuer: iss
      jwtAudience: aud
      jwtExpiresIn: 24h
    twitter: {}
  tenantTwitterOnly:
    allowedOrigins: ["https://app.example.com"]
    defaultRedirectOrigin: https://app.example.com
    redirectPath: /auth/result
    line: {}
    twitter:
      clientID: tid
      clientSecret: tsec
      redirectURI: https://app.example.com/tcb
      scopes: ["tweet.read"]
      stateSecret: tstate
      stateTTL: 10m
      jwtSecret: tjwt
      jwtIssuer: twiss
      jwtAudience: twaud
      jwtExpiresIn: 24h
`

	dir := t.TempDir()
	cfgPath := filepath.Join(dir, "tenants.yaml")
	if err := os.WriteFile(cfgPath, []byte(cfg), 0o644); err != nil {
		t.Fatalf("write cfg: %v", err)
	}

	loader, err := newTenantResolverForTest(cfgPath)
	if err != nil {
		t.Fatalf("resolver init: %v", err)
	}

	tests := []struct {
		name      string
		tenantID  string
		resolve   string
		wantError bool
	}{
		{name: "line enabled", tenantID: "tenantLineOnly", resolve: "line"},
		{name: "line disabled", tenantID: "tenantTwitterOnly", resolve: "line", wantError: true},
		{name: "twitter enabled", tenantID: "tenantTwitterOnly", resolve: "twitter"},
		{name: "twitter disabled", tenantID: "tenantLineOnly", resolve: "twitter", wantError: true},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			switch tt.resolve {
			case "line":
				_, err := loader.ResolveLine(tt.tenantID)
				if tt.wantError && err == nil {
					t.Fatalf("want error, got nil")
				}
				if !tt.wantError && err != nil {
					t.Fatalf("unexpected error: %v", err)
				}
			case "twitter":
				_, err := loader.ResolveTwitter(tt.tenantID)
				if tt.wantError && err == nil {
					t.Fatalf("want error, got nil")
				}
				if !tt.wantError && err != nil {
					t.Fatalf("unexpected error: %v", err)
				}
			default:
				t.Fatalf("unknown resolve type")
			}
		})
	}
}

// newTenantResolverForTest はHTTPクライアントを差し替えたテスト用初期化ヘルパー。
func newTenantResolverForTest(path string) (*tenantResolver, error) {
	loader, err := tenant.NewLoader(path)
	if err != nil {
		return nil, err
	}
	client := &http.Client{Timeout: 30 * time.Second}
	return newTenantResolver(loader, client, func(string, ...any) {}), nil
}
