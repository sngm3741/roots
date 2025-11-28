package twitterlogin

import (
	"context"

	"github.com/sngm3741/roots/base/auth/internal/domain/twitteruser"
)

// TwitterClient はTwitter OAuth2 APIとのやりとりを抽象化する。
type TwitterClient interface {
	BuildAuthorizeURL(state, codeChallenge string) string
	ExchangeToken(ctx context.Context, code, codeVerifier string) (*Token, error)
	FetchProfile(ctx context.Context, accessToken string) (*Profile, error)
}

// Token はTwitterトークンエンドポイントの結果をユースケース向けに整形したもの。
type Token struct {
	AccessToken  string
	RefreshToken string
	TokenType    string
	ExpiresIn    int
}

// Profile はTwitterプロフィールAPIの結果をユースケース向けに整形したもの。
type Profile struct {
	ID          twitteruser.ID
	DisplayName string
	Username    string
	AvatarURL   string
}
