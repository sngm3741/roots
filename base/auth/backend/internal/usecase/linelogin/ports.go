package linelogin

import (
	"context"

	"github.com/sngm3741/roots/base/auth/internal/domain/lineuser"
)

// LineClient はLINE OAuth/API呼び出しのポート定義。
type LineClient interface {
	BuildAuthorizeURL(state string) string
	ExchangeToken(ctx context.Context, code string) (*LineToken, error)
	FetchProfile(ctx context.Context, accessToken string) (*LineProfile, error)
}

// LineToken はLINEトークンエンドポイントの応答をユースケース向けにまとめたもの。
type LineToken struct {
	AccessToken string
	ExpiresIn   int
	TokenType   string
}

// LineProfile はLINEプロフィールAPIの結果をユースケース向けに整形したもの。
type LineProfile struct {
	ID          lineuser.ID
	DisplayName string
	AvatarURL   string
}
