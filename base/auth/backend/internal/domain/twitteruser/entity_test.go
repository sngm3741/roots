package twitteruser

import "testing"

// ID生成とUser生成のテーブル駆動テスト。
func TestIDAndUser(t *testing.T) {
	t.Parallel()

	t.Run("NewID", func(t *testing.T) {
		t.Parallel()
		tests := []struct {
			name    string
			input   string
			wantErr error
		}{
			{name: "OK", input: "12345"},
			{name: "空はエラー", input: "  ", wantErr: ErrInvalidID},
		}
		for _, tt := range tests {
			tt := tt
			t.Run(tt.name, func(t *testing.T) {
				t.Parallel()
				_, err := NewID(tt.input)
				if tt.wantErr == nil && err != nil {
					t.Fatalf("unexpected err: %v", err)
				}
				if tt.wantErr != nil && err != tt.wantErr {
					t.Fatalf("want %v, got %v", tt.wantErr, err)
				}
			})
		}
	})

	t.Run("User New", func(t *testing.T) {
		t.Parallel()
		id, _ := NewID("u1")
		tests := []struct {
			name      string
			id        ID
			wantError bool
		}{
			{name: "OK", id: id},
			{name: "空IDでエラー", id: "", wantError: true},
		}
		for _, tt := range tests {
			tt := tt
			t.Run(tt.name, func(t *testing.T) {
				t.Parallel()
				u, err := New(tt.id, "name", "disp", "")
				if tt.wantError {
					if err == nil {
						t.Fatalf("want error, got nil")
					}
					return
				}
				if err != nil {
					t.Fatalf("unexpected err: %v", err)
				}
				if u.ID() != tt.id {
					t.Fatalf("id mismatch")
				}
			})
		}
	})
}
