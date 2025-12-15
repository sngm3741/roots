package twitterlogin

import (
	"testing"
	"time"
)

// テーブル駆動で state 発行/検証を確認。
func TestHMACStateManager_IssueVerify(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		now     time.Time
		advance time.Duration
		wantErr error
	}{
		{
			name:    "正常: 発行したstateを即検証",
			now:     time.Date(2025, 1, 1, 0, 0, 0, 0, time.UTC),
			advance: 0,
		},
		{
			name:    "期限切れ",
			now:     time.Date(2025, 1, 1, 0, 0, 0, 0, time.UTC),
			advance: 2 * time.Minute,
			wantErr: ErrStateExpired,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			m := NewHMACStateManager([]byte("secret"), time.Minute)
			m.now = func() time.Time { return tt.now }

			state, payload, err := m.Issue("https://app.example.com")
			if err != nil {
				t.Fatalf("Issue error: %v", err)
			}

			m.now = func() time.Time { return tt.now.Add(tt.advance) }
			verified, err := m.Verify(state)
			if tt.wantErr != nil {
				if err == nil || err != tt.wantErr {
					t.Fatalf("expected %v, got %v", tt.wantErr, err)
				}
				return
			}
			if err != nil {
				t.Fatalf("Verify error: %v", err)
			}
			if verified.Origin != payload.Origin {
				t.Fatalf("origin mismatch")
			}
		})
	}
}
