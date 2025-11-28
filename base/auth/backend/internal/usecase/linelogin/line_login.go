package linelogin

import (
	"context"
	"errors"
	"strings"

	"github.com/sngm3741/roots/base/auth/internal/domain/user"
)

var (
	// ErrOriginRequired はオリジンが未指定の場合に返す。
	ErrOriginRequired = errors.New("origin is required")
	// ErrOriginNotAllowed は許可されていないオリジンの場合に返す。
	ErrOriginNotAllowed = errors.New("origin not allowed")
)

// Usecase はLINEログインの開始とコールバック処理を司るアプリケーションサービス。
type Usecase struct {
	states                StateManager
	line                  LineClient
	tokens                TokenIssuer
	allowedOrigins        map[string]struct{}
	defaultRedirectOrigin string
}

// StartOutput はログイン開始時の戻り値。
type StartOutput struct {
	AuthorizationURL string
	State            string
}

// CallbackResult はコールバック処理の結果を表す。
type CallbackResult struct {
	Success      bool
	State        string
	Origin       string
	ErrorMessage string
	Payload      *ResultPayload
}

// ResultPayload は成功時に返すアクセストークンとユーザー情報。
type ResultPayload struct {
	AccessToken string
	TokenType   string
	ExpiresIn   int
	LineUser    LineUserPayload
}

// LineUserPayload はレスポンス用に整えたLINEユーザー情報。
type LineUserPayload struct {
	ID          string
	DisplayName string
	AvatarURL   string
}

// NewUsecase はLINEログイン用ユースケースを初期化する。
func NewUsecase(states StateManager, line LineClient, tokens TokenIssuer, allowedOrigins map[string]struct{}, defaultRedirectOrigin string) *Usecase {
	copied := make(map[string]struct{}, len(allowedOrigins))
	for k, v := range allowedOrigins {
		copied[k] = v
	}
	return &Usecase{
		states:                states,
		line:                  line,
		tokens:                tokens,
		allowedOrigins:        copied,
		defaultRedirectOrigin: strings.TrimSpace(defaultRedirectOrigin),
	}
}

func (u *Usecase) Start(ctx context.Context, origin string) (*StartOutput, error) {
	origin = strings.TrimSpace(origin)
	if origin == "" {
		return nil, ErrOriginRequired
	}
	if !u.isOriginAllowed(origin) {
		return nil, ErrOriginNotAllowed
	}

	state, _, err := u.states.Issue(origin)
	if err != nil {
		return nil, err
	}

	return &StartOutput{
		AuthorizationURL: u.line.BuildAuthorizeURL(state),
		State:            state,
	}, nil
}

func (u *Usecase) Callback(ctx context.Context, code, stateParam string) (*CallbackResult, error) {
	code = strings.TrimSpace(code)
	stateParam = strings.TrimSpace(stateParam)

	if code == "" || stateParam == "" {
		origin := u.extractOrigin(stateParam)
		return &CallbackResult{
			Success:      false,
			State:        stateParam,
			Origin:       origin,
			ErrorMessage: "無効なログイン応答です。再度お試しください。",
		}, nil
	}

	payload, err := u.states.Verify(stateParam)
	if err != nil {
		origin := u.extractOrigin(stateParam)
		message := "無効なログイン試行です。再度お試しください。"
		if errors.Is(err, ErrStateExpired) {
			message = "ログインの有効期限が切れました。もう一度お試しください。"
		}
		return &CallbackResult{
			Success:      false,
			State:        stateParam,
			Origin:       origin,
			ErrorMessage: message,
		}, nil
	}

	tokenResp, err := u.line.ExchangeToken(ctx, code)
	if err != nil {
		return &CallbackResult{
			Success:      false,
			State:        stateParam,
			Origin:       payload.Origin,
			ErrorMessage: "LINE認証との通信に失敗しました。時間を置いて再度お試しください。",
		}, nil
	}

	profile, err := u.line.FetchProfile(ctx, tokenResp.AccessToken)
	if err != nil {
		return &CallbackResult{
			Success:      false,
			State:        stateParam,
			Origin:       payload.Origin,
			ErrorMessage: "LINEプロフィールの取得に失敗しました。",
		}, nil
	}

	uProfile, err := user.New(profile.ID, profile.DisplayName, profile.AvatarURL)
	if err != nil {
		return nil, err
	}

	appToken, expiresIn, err := u.tokens.Issue(uProfile)
	if err != nil {
		return &CallbackResult{
			Success:      false,
			State:        stateParam,
			Origin:       payload.Origin,
			ErrorMessage: "アクセストークンの生成に失敗しました。",
		}, nil
	}

	return &CallbackResult{
		Success: true,
		State:   stateParam,
		Origin:  payload.Origin,
		Payload: &ResultPayload{
			AccessToken: appToken,
			TokenType:   "Bearer",
			ExpiresIn:   expiresIn,
			LineUser: LineUserPayload{
				ID:          string(uProfile.ID()),
				DisplayName: uProfile.DisplayName(),
				AvatarURL:   uProfile.AvatarURL(),
			},
		},
	}, nil
}

func (u *Usecase) extractOrigin(state string) string {
	if state == "" {
		return u.defaultRedirectOrigin
	}
	payload, err := u.states.Decode(state)
	if err != nil {
		return u.defaultRedirectOrigin
	}
	if payload.Origin != "" {
		return payload.Origin
	}
	return u.defaultRedirectOrigin
}

// isOriginAllowed は許可オリジンかどうかを判定する。
func (u *Usecase) isOriginAllowed(origin string) bool {
	if origin == "" {
		return false
	}
	if len(u.allowedOrigins) == 0 {
		return true
	}
	_, ok := u.allowedOrigins[origin]
	return ok
}
