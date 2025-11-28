package file

import "testing"

// IsAllowedContentTypeのパターンをテーブル駆動で検証。
func TestIsAllowedContentType(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name    string
		ct      string
		allowed []string
		want    bool
	}{
		{"許可リスト空→許可", "image/png", nil, true},
		{"前方一致OK", "image/png", []string{"image/"}, true},
		{"ワイルドカードOK", "text/plain", []string{"text/*"}, true},
		{"不一致", "application/json", []string{"image/"}, false},
		{"空ctは拒否", "", []string{"image/"}, false},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			if got := IsAllowedContentType(tt.ct, tt.allowed); got != tt.want {
				t.Fatalf("got %v, want %v", got, tt.want)
			}
		})
	}
}
