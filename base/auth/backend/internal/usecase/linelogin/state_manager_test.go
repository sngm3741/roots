package linelogin

import (
	"testing"
	"time"
)

func TestHMACStateManager_IssueAndVerify(t *testing.T) {
	secret := []byte("secret")
	m := NewHMACStateManager(secret, time.Minute)
	fixed := time.Date(2025, 1, 1, 0, 0, 0, 0, time.UTC)
	m.now = func() time.Time { return fixed }

	state, payload, err := m.Issue("https://app.example.com")
	if err != nil {
		t.Fatalf("Issue error: %v", err)
	}
	if payload.Origin != "https://app.example.com" {
		t.Fatalf("got origin %q", payload.Origin)
	}

	verified, err := m.Verify(state)
	if err != nil {
		t.Fatalf("Verify error: %v", err)
	}
	if verified.Origin != payload.Origin {
		t.Fatalf("origin mismatch: %q vs %q", verified.Origin, payload.Origin)
	}
}

func TestHMACStateManager_Expired(t *testing.T) {
	secret := []byte("secret")
	m := NewHMACStateManager(secret, time.Minute)
	fixed := time.Date(2025, 1, 1, 0, 0, 0, 0, time.UTC)
	m.now = func() time.Time { return fixed }

	state, _, err := m.Issue("https://app.example.com")
	if err != nil {
		t.Fatalf("Issue error: %v", err)
	}

	// Advance time beyond TTL.
	m.now = func() time.Time { return fixed.Add(2 * time.Minute) }

	if _, err := m.Verify(state); err == nil {
		t.Fatalf("expected expiration error")
	} else if err != ErrStateExpired {
		t.Fatalf("unexpected error: %v", err)
	}
}
