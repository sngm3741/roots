package httpadapter

import (
	"context"
	"errors"

	"github.com/sngm3741/roots/base/auth/internal/usecase/linelogin"
	"github.com/sngm3741/roots/base/auth/internal/usecase/twitterlogin"
)

// プロバイダが無効な場合に返すエラー。
var (
	ErrLineDisabled    = errors.New("line disabled for tenant")
	ErrTwitterDisabled = errors.New("twitter disabled for tenant")
)

// LineTenantDeps はテナント別のLINEログイン用依存をまとめる。
type LineTenantDeps struct {
	Usecase               LineUsecase
	AllowedOrigins        map[string]struct{}
	DefaultRedirectOrigin string
	RedirectPath          string
}

// LineUsecase はLINEログインユースケースの最小インターフェース。
type LineUsecase interface {
	Start(ctx context.Context, origin string) (*linelogin.StartOutput, error)
	Callback(ctx context.Context, code, stateParam string) (*linelogin.CallbackResult, error)
}

// LineTenantResolver はテナントIDからLINE用依存を解決する。
type LineTenantResolver interface {
	ResolveLine(tenantID string) (LineTenantDeps, error)
}

// TwitterTenantDeps はテナント別のTwitterログイン用依存をまとめる。
type TwitterTenantDeps struct {
	Usecase               TwitterUsecase
	AllowedOrigins        map[string]struct{}
	DefaultRedirectOrigin string
	RedirectPath          string
}

// TwitterUsecase はTwitterログインユースケースの最小インターフェース。
type TwitterUsecase interface {
	Start(ctx context.Context, origin string) (*twitterlogin.StartOutput, error)
	Callback(ctx context.Context, code, stateParam string) (*twitterlogin.CallbackResult, error)
	DecodeState(state string) (*twitterlogin.StatePayload, error)
}

// TwitterTenantResolver はテナントIDからTwitter用依存を解決する。
type TwitterTenantResolver interface {
	ResolveTwitter(tenantID string) (TwitterTenantDeps, error)
}
