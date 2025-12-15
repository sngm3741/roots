package storage

import (
	"context"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"path"
	"strings"

	"github.com/aws/aws-sdk-go-v2/aws"
	awscfg "github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/credentials"
	"github.com/aws/aws-sdk-go-v2/service/s3"

	"github.com/sngm3741/roots/base/storage/internal/config"
)

// Uploader はストレージへのアップロードを抽象化する。
type Uploader interface {
	Upload(ctx context.Context, key string, contentType string, body io.Reader, size int64) (string, error)
}

// S3Uploader はS3互換ストレージへのアップロードを行う実装。
type S3Uploader struct {
	client      *s3.Client
	bucket      string
	publicBase  string
	rawEndpoint string
}

// NewS3Uploader はS3互換ストレージクライアントを生成する。
func NewS3Uploader(ctx context.Context, cfg config.Config) (*S3Uploader, error) {
	awsCfg, err := awscfg.LoadDefaultConfig(ctx,
		awscfg.WithRegion("auto"),
		awscfg.WithCredentialsProvider(credentials.NewStaticCredentialsProvider(cfg.AccessKeyID, cfg.SecretAccessKey, "")),
		awscfg.WithHTTPClient(&http.Client{Timeout: cfg.HTTPTimeout}),
	)
	if err != nil {
		return nil, fmt.Errorf("load aws config: %w", err)
	}

	client := s3.NewFromConfig(awsCfg, func(o *s3.Options) {
		o.UsePathStyle = true
		o.BaseEndpoint = aws.String(cfg.Endpoint)
	})

	return &S3Uploader{
		client:      client,
		bucket:      cfg.Bucket,
		publicBase:  cfg.PublicBaseURL,
		rawEndpoint: cfg.Endpoint,
	}, nil
}

// Upload はオブジェクトをアップロードし、公開URLを返す。
func (s *S3Uploader) Upload(ctx context.Context, key string, contentType string, body io.Reader, size int64) (string, error) {
	_, err := s.client.PutObject(ctx, &s3.PutObjectInput{
		Bucket:      aws.String(s.bucket),
		Key:         aws.String(key),
		Body:        body,
		ContentType: aws.String(contentType),
	})
	if err != nil {
		return "", fmt.Errorf("put object: %w", err)
	}
	return s.objectURL(key), nil
}

func (s *S3Uploader) objectURL(key string) string {
	if s.publicBase != "" {
		return strings.TrimSuffix(s.publicBase, "/") + "/" + key
	}
	u, err := url.Parse(s.rawEndpoint)
	if err != nil {
		return ""
	}
	u.Path = path.Join(u.Path, s.bucket, key)
	return u.String()
}
