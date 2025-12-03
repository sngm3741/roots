package lineevent

import (
	"encoding/json"
	"testing"
	"time"
)

// Event生成のテーブル駆動テスト。
func TestEventNew(t *testing.T) {
	t.Parallel()
	body := json.RawMessage(`{"msg":"hi"}`)
	now := time.Now()
	tests := []struct {
		name      string
		dest      string
		etype     string
		uid       string
		wantError error
	}{
		{name: "正常", dest: "line", etype: "message", uid: "U1"},
		{name: "etype空はエラー", dest: "line", uid: "U1", wantError: ErrInvalidEvent},
		{name: "uid空はエラー", dest: "line", etype: "message", wantError: ErrInvalidEvent},
	}
	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			ev, err := New(tt.dest, tt.etype, tt.uid, body, now)
			if tt.wantError != nil {
				if err != tt.wantError {
					t.Fatalf("want %v, got %v", tt.wantError, err)
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected err: %v", err)
			}
			if ev.EventType() != tt.etype || ev.UserID() != tt.uid {
				t.Fatalf("field mismatch")
			}
			if string(ev.Message()) == "" {
				t.Fatalf("message empty")
			}
		})
	}
}
