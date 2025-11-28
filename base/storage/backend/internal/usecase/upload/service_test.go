package upload

import (
	"context"
	"errors"
	"io"
	"strings"
	"testing"
)

type fakeStorage struct {
	key string
	url string
	err error
}

func (f *fakeStorage) Upload(ctx context.Context, key string, contentType string, body io.Reader, size int64) (string, error) {
	f.key = key
	f.url = "http://example.com/" + key
	return f.url, f.err
}

// Uploadの主要分岐をテーブル駆動で検証。
func TestService_Upload(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name       string
		input      Input
		allowed    []string
		maxSize    int64
		storageErr error
		wantErr    error
	}{
		{
			name: "正常: 許可タイプでサイズ内",
			input: Input{
				Filename:    "pic.jpg",
				ContentType: "image/jpeg",
				Size:        10,
				Body:        strings.NewReader("0123456789"),
			},
			allowed: []string{"image/"},
			maxSize: 20,
		},
		{
			name: "サイズ超過でエラー",
			input: Input{
				Filename:    "pic.jpg",
				ContentType: "image/jpeg",
				Size:        30,
				Body:        strings.NewReader("012345678901234567890"),
			},
			maxSize: 20,
			wantErr: ErrTooLarge,
		},
		{
			name: "許可されないContent-Type",
			input: Input{
				Filename:    "doc.txt",
				ContentType: "text/plain",
				Size:        5,
				Body:        strings.NewReader("hello"),
			},
			allowed: []string{"image/"},
			maxSize: 20,
			wantErr: ErrDisallowedType,
		},
		{
			name: "ストレージエラーを返す",
			input: Input{
				Filename:    "pic.jpg",
				ContentType: "image/jpeg",
				Size:        10,
				Body:        strings.NewReader("0123456789"),
			},
			allowed:    []string{"image/"},
			maxSize:    20,
			storageErr: errors.New("storage fail"),
			wantErr:    errors.New("storage fail"),
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			st := &fakeStorage{err: tt.storageErr}
			uc := NewService(st, tt.allowed, tt.maxSize)
			uc.keyGen = func() string { return "key" }

			key, url, err := uc.Upload(context.Background(), tt.input)
			if tt.wantErr != nil {
				if err == nil || err.Error() != tt.wantErr.Error() {
					t.Fatalf("expected err %v, got %v", tt.wantErr, err)
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if key == "" || url == "" {
				t.Fatalf("missing outputs: key=%s url=%s", key, url)
			}
		})
	}
}
