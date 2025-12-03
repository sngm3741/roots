package discordmsg

import (
	"testing"
	"time"
)

// Discord Message生成のテーブル駆動テスト。
func TestMessageNew(t *testing.T) {
	t.Parallel()

	now := time.Now()
	tests := []struct {
		name      string
		dest      string
		user      string
		content   string
		wantError error
	}{
		{name: "正常", dest: "discord", user: "U1", content: "hello"},
		{name: "内容空でエラー", dest: "discord", user: "U1", content: " ", wantError: ErrInvalidMessage},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			msg, err := New(tt.dest, tt.user, tt.content, now)
			if tt.wantError != nil {
				if err != tt.wantError {
					t.Fatalf("want %v, got %v", tt.wantError, err)
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected err: %v", err)
			}
			if msg.Content() != tt.content {
				t.Fatalf("content mismatch")
			}
			if msg.Destination() != tt.dest || msg.UserID() != tt.user {
				t.Fatalf("field mismatch")
			}
			if msg.ReceivedAt().IsZero() {
				t.Fatalf("receivedAt should be set")
			}
		})
	}
}
