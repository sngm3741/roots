package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"io"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"github.com/sngm3741/roots/base/storage/internal/usecase/upload"
)

// UploadHandler はHTTP経由のアップロードを受け付ける。
type UploadHandler struct {
	usecase uploadService
	maxBody int64
}

// uploadService はusecase.Uploadのインターフェース。
type uploadService interface {
	Upload(ctx context.Context, in upload.Input) (key string, url string, err error)
}

// NewUploadHandler はUploadHandlerを生成する。
func NewUploadHandler(uc uploadService, maxBody int64) *UploadHandler {
	return &UploadHandler{
		usecase: uc,
		maxBody: maxBody,
	}
}

// Router は/healthzと/uploadsを持つルーターを返す。
func (h *UploadHandler) Router() http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.RequestID, middleware.RealIP, middleware.Recoverer, middleware.Timeout(30*time.Second))
	r.Get("/healthz", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte(`{"status":"ok"}`))
	})
	r.Post("/uploads", h.handleUpload)
	return r
}

func (h *UploadHandler) handleUpload(w http.ResponseWriter, r *http.Request) {
	r.Body = http.MaxBytesReader(w, r.Body, h.maxBody+1024)
	if err := r.ParseMultipartForm(h.maxBody); err != nil {
		http.Error(w, "failed to parse multipart form", http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "file field is required", http.StatusBadRequest)
		return
	}
	defer file.Close()

	buf := &bytes.Buffer{}
	n, err := io.Copy(buf, file)
	if err != nil {
		http.Error(w, "failed to read file", http.StatusInternalServerError)
		return
	}

	contentType := header.Header.Get("Content-Type")
	if contentType == "" {
		contentType = http.DetectContentType(buf.Bytes())
	}

	key, url, err := h.usecase.Upload(r.Context(), upload.Input{
		Filename:    header.Filename,
		ContentType: contentType,
		Size:        n,
		Body:        bytes.NewReader(buf.Bytes()),
	})
	if err != nil {
		switch err {
		case upload.ErrTooLarge:
			http.Error(w, err.Error(), http.StatusRequestEntityTooLarge)
		case upload.ErrDisallowedType:
			http.Error(w, err.Error(), http.StatusBadRequest)
		default:
			http.Error(w, "upload failed", http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]string{
		"url": url,
		"key": key,
	})
}
