package lineuser

import "testing"

// NewID/Newのバリデーションをテーブル駆動で検証。
func TestLineUserValidation(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name        string
		id          string
		displayName string
		avatarURL   string
		wantErr     bool
	}{
		{"OK", "U123", "Taro", "http://example.com", false},
		{"空IDでエラー", "", "Taro", "", true},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			id, err := NewID(tt.id)
			if tt.wantErr {
				if err == nil {
					t.Fatalf("expected error")
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if _, err := New(id, tt.displayName, tt.avatarURL); err != nil {
				t.Fatalf("New error: %v", err)
			}
		})
	}
}
