package tenant

import (
	"os"
	"path/filepath"
	"testing"
	"time"
)

func TestLoadConfig_File(t *testing.T) {
	t.Parallel()
	data := []byte(`
auth:
  t1:
    allowedOrigins: ["https://app.example.com"]
    defaultRedirectOrigin: https://app.example.com
    redirectPath: /auth/result
    line:
      channelID: line-id
      channelSecret: line-secret
      redirectURI: https://app.example.com/auth/line/callback
      scopes: ["profile"]
      stateSecret: st
      stateTTL: 10m
      jwtSecret: jwt
      jwtIssuer: iss
      jwtAudience: aud
      jwtExpiresIn: 24h
    twitter:
      clientID: tw-id
      clientSecret: tw-secret
      redirectURI: https://app.example.com/auth/twitter/callback
      scopes: ["tweet.read"]
      stateSecret: st2
      stateTTL: 5m
      jwtSecret: jwt2
      jwtIssuer: iss2
      jwtAudience: aud2
      jwtExpiresIn: 12h
`)
	dir := t.TempDir()
	p := filepath.Join(dir, "tenant.yaml")
	if err := os.WriteFile(p, data, 0o644); err != nil {
		t.Fatalf("write file: %v", err)
	}
	loader, err := NewLoader(p)
	if err != nil {
		t.Fatalf("loader: %v", err)
	}
	ten, ok := loader.AuthConfig("t1")
	if !ok {
		t.Fatalf("tenant missing")
	}
	if ten.Line.StateTTL != 10*time.Minute || ten.Twitter.JWTExpiresIn != 12*time.Hour {
		t.Fatalf("unexpected parsed values: %+v", ten)
	}
}

func TestLoadConfig_DirectoryMergeOverride(t *testing.T) {
	t.Parallel()
	dir := t.TempDir()

	first := []byte(`
auth:
  dup:
    allowedOrigins: ["https://a.example.com"]
    defaultRedirectOrigin: https://a.example.com
    redirectPath: /auth/result
    line:
      channelID: old-line
      channelSecret: old-secret
      redirectURI: https://a.example.com/auth/line/callback
      scopes: ["profile"]
      stateSecret: st
      stateTTL: 10m
      jwtSecret: jwt
      jwtIssuer: iss
      jwtAudience: aud
      jwtExpiresIn: 24h
`)
	second := []byte(`
auth:
  dup:
    allowedOrigins: ["https://b.example.com"]
    defaultRedirectOrigin: https://b.example.com
    redirectPath: /auth/result
    line:
      channelID: new-line
      channelSecret: new-secret
      redirectURI: https://b.example.com/auth/line/callback
      scopes: ["openid"]
      stateSecret: st2
      stateTTL: 20m
      jwtSecret: jwt2
      jwtIssuer: iss2
      jwtAudience: aud2
      jwtExpiresIn: 12h
`)
	if err := os.WriteFile(filepath.Join(dir, "01.yaml"), first, 0o644); err != nil {
		t.Fatalf("write first: %v", err)
	}
	if err := os.WriteFile(filepath.Join(dir, "02.yaml"), second, 0o644); err != nil {
		t.Fatalf("write second: %v", err)
	}

	loader, err := NewLoader(dir)
	if err != nil {
		t.Fatalf("loader: %v", err)
	}
	dup, ok := loader.AuthConfig("dup")
	if !ok {
		t.Fatalf("dup missing")
	}
	if dup.Line.ChannelID != "new-line" || dup.Line.JWTExpiresIn != 12*time.Hour {
		t.Fatalf("override not applied: %+v", dup)
	}
	if dup.AllowedOrigins[0] != "https://b.example.com" {
		t.Fatalf("allowedOrigins not overridden: %+v", dup.AllowedOrigins)
	}
}

func TestLoadConfig_EmptyError(t *testing.T) {
	t.Parallel()
	dir := t.TempDir()
	empty := []byte(`auth: {}`)
	p := filepath.Join(dir, "empty.yaml")
	if err := os.WriteFile(p, empty, 0o644); err != nil {
		t.Fatalf("write: %v", err)
	}
	if _, err := NewLoader(p); err == nil {
		t.Fatalf("expected error for empty tenants")
	}
}
