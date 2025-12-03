package message

import (
	"testing"
	"time"
)

// Message生成のテーブル駆動テスト。
func TestMessageNew(t *testing.T) {
	t.Parallel()

	now := time.Date(2025, 1, 2, 3, 4, 5, 0, time.UTC)
	tests := []struct {
		name      string
		dest      string
		user      string
		text      string
		ts        time.Time
		wantError error
	}{
		{name: "正常", dest: "line", user: "U1", text: "hi", ts: now},
		{name: "宛先空でエラー", user: "U1", text: "hi", ts: now, wantError: ErrEmptyDestination},
		{name: "user空でエラー", dest: "line", text: "hi", ts: now, wantError: ErrEmptyUserID},
		{name: "本文空でエラー", dest: "line", user: "U1", text: " ", ts: now, wantError: ErrEmptyText},
		{name: "時刻ゼロならUTCに補正", dest: "line", user: "U1", text: "hi"},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			msg, err := New(tt.dest, tt.user, tt.text, tt.ts)
			if tt.wantError != nil {
				if err != tt.wantError {
					t.Fatalf("want %v, got %v", tt.wantError, err)
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected err: %v", err)
			}
			if msg.Destination() != tt.dest {
				t.Fatalf("dest mismatch")
			}
			if msg.UserID() != tt.user {
				t.Fatalf("user mismatch")
			}
			if msg.Text() != tt.text {
				t.Fatalf("text mismatch")
			}
			if msg.ReceivedAt().IsZero() {
				t.Fatalf("expected non zero time")
			}
			if tt.ts.IsZero() && !msg.ReceivedAt().Equal(msg.ReceivedAt().UTC()) {
				t.Fatalf("timestamp should be UTC")
			}
		})
	}
}
