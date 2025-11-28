package upload

import (
	"context"
	"fmt"
	"io"
	"path/filepath"
	"strings"

	"github.com/google/uuid"

	"github.com/sngm3741/roots/base/storage/internal/domain/file"
)

// Storage はオブジェクトストレージへのアップロードを抽象化する。
type Storage interface {
	Upload(ctx context.Context, key string, contentType string, body io.Reader, size int64) (string, error)
}

// Service はアップロード処理を司る。
type Service struct {
	storage       Storage
	allowedTypes  []string
	maxUploadSize int64
	keyGen        func() string
}

// NewService はServiceを生成する。
func NewService(storage Storage, allowedTypes []string, maxUploadSize int64) *Service {
	return &Service{
		storage:       storage,
		allowedTypes:  allowedTypes,
		maxUploadSize: maxUploadSize,
		keyGen: func() string {
			return uuid.New().String()
		},
	}
}

// ErrTooLarge はファイルサイズ超過時に返す。
var ErrTooLarge = fmt.Errorf("upload: file too large")

// ErrDisallowedType は許可されないContent-Typeの場合に返す。
var ErrDisallowedType = fmt.Errorf("upload: disallowed content type")

// Input はアップロードに必要な情報をまとめる。
type Input struct {
	Filename    string
	ContentType string
	Size        int64
	Body        io.Reader
}

// Upload は入力を検証し、ストレージへアップロードする。
func (s *Service) Upload(ctx context.Context, in Input) (key string, url string, err error) {
	if s.maxUploadSize > 0 && in.Size > s.maxUploadSize {
		return "", "", ErrTooLarge
	}
	if !file.IsAllowedContentType(in.ContentType, s.allowedTypes) {
		return "", "", ErrDisallowedType
	}

	key = s.generateKey(in.Filename)
	url, err = s.storage.Upload(ctx, key, in.ContentType, in.Body, in.Size)
	if err != nil {
		return "", "", err
	}
	return key, url, nil
}

func (s *Service) generateKey(filename string) string {
	base := s.keyGen()
	ext := strings.ToLower(filepath.Ext(filename))
	if ext == "" {
		return base
	}
	return base + ext
}
