package handler

import (
	"bytes"
	"context"
	"io"
	"mime/multipart"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/sngm3741/roots/base/storage/internal/usecase/upload"
)

type fakeUploadUsecase struct {
	key string
	url string
	err error
}

func (f *fakeUploadUsecase) Upload(ctx context.Context, in upload.Input) (string, string, error) {
	return f.key, f.url, f.err
}

// /uploads のバリデーション/レスポンスをテーブル駆動で検証。
func TestUploadHandler_HandleUpload(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name       string
		fileField  string
		content    string
		ctype      string
		usecaseErr error
		wantCode   int
	}{
		{
			name:      "正常にアップロード",
			fileField: "file",
			content:   "hello",
			ctype:     "text/plain",
			wantCode:  http.StatusOK,
		},
		{
			name:      "fileフィールドなしで400",
			fileField: "other",
			content:   "hello",
			ctype:     "text/plain",
			wantCode:  http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			fake := &fakeUploadUsecase{key: "k", url: "http://example.com/k", err: tt.usecaseErr}
			h := NewUploadHandler(fake, 1024)

			body := &bytes.Buffer{}
			writer := multipart.NewWriter(body)
			part, _ := writer.CreateFormFile(tt.fileField, "test.txt")
			_, _ = io.Copy(part, bytes.NewBufferString(tt.content))
			writer.Close()

			req := httptest.NewRequest(http.MethodPost, "/uploads", body)
			req.Header.Set("Content-Type", writer.FormDataContentType())
			rr := httptest.NewRecorder()

			h.Router().ServeHTTP(rr, req)

			if rr.Code != tt.wantCode {
				t.Fatalf("status=%d body=%s", rr.Code, rr.Body.String())
			}
		})
	}
}
