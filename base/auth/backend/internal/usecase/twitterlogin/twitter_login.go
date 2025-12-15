package twitterlogin

import (
	"context"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"strings"

	"github.com/sngm3741/roots/base/auth/internal/domain/twitteruser"
)

var (
	// ErrOriginRequired はオリジンが未指定の場合に返す。
	ErrOriginRequired = errors.New("origin is required")
	// ErrOriginNotAllowed は許可されていないオリジンの場合に返す。
	ErrOriginNotAllowed = errors.New("origin not allowed")
)

// Usecase はTwitterログインの開始とコールバック処理を司るアプリケーションサービス。
type Usecase struct {
	states                StateManager
	twitter               TwitterClient
	tokens                TokenIssuer
	verifiers             *verifierStore
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
	TwitterUser TwitterUserPayload
}

// TwitterUserPayload はレスポンス用に整えたTwitterユーザー情報。
type TwitterUserPayload struct {
	ID          string
	Username    string
	DisplayName string
	AvatarURL   string
}

// NewUsecase はTwitterログイン用ユースケースを初期化する。
func NewUsecase(states StateManager, twitter TwitterClient, tokens TokenIssuer, allowedOrigins map[string]struct{}, defaultRedirectOrigin string) *Usecase {
	copied := make(map[string]struct{}, len(allowedOrigins))
	for k, v := range allowedOrigins {
		copied[k] = v
	}
	return &Usecase{
		states:                states,
		twitter:               twitter,
		tokens:                tokens,
		verifiers:             newVerifierStore(),
		allowedOrigins:        copied,
		defaultRedirectOrigin: strings.TrimSpace(defaultRedirectOrigin),
	}
}

// Start はPKCE code_challenge と state を生成し、認可URLを返す。
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

	codeVerifier, err := generateCodeVerifier()
	if err != nil {
		return nil, err
	}
	codeChallenge := codeChallengeS256(codeVerifier)
	u.verifiers.Store(state, codeVerifier)

	return &StartOutput{
		AuthorizationURL: u.twitter.BuildAuthorizeURL(state, codeChallenge),
		State:            state,
	}, nil
}

// Callback はTwitterからのコールバックを処理し、JWTを含む結果を返す。
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

	codeVerifier, ok := u.verifiers.Take(stateParam)
	if !ok {
		return &CallbackResult{
			Success:      false,
			State:        stateParam,
			Origin:       payload.Origin,
			ErrorMessage: "ログインの有効期限が切れました。もう一度お試しください。",
		}, nil
	}

	tokenResp, err := u.twitter.ExchangeToken(ctx, code, codeVerifier)
	if err != nil {
		return &CallbackResult{
			Success:      false,
			State:        stateParam,
			Origin:       payload.Origin,
			ErrorMessage: "X認証との通信に失敗しました。時間を置いて再度お試しください。",
		}, nil
	}

	profile, err := u.twitter.FetchProfile(ctx, tokenResp.AccessToken)
	if err != nil {
		return &CallbackResult{
			Success:      false,
			State:        stateParam,
			Origin:       payload.Origin,
			ErrorMessage: "Xプロフィールの取得に失敗しました。",
		}, nil
	}

	tu, err := twitteruser.New(profile.ID, profile.Username, profile.DisplayName, profile.AvatarURL)
	if err != nil {
		return nil, err
	}

	appToken, expiresIn, err := u.tokens.Issue(tu)
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
			TwitterUser: TwitterUserPayload{
				ID:          string(tu.ID()),
				Username:    tu.Username(),
				DisplayName: tu.DisplayName(),
				AvatarURL:   tu.AvatarURL(),
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

// DecodeState はstateをデコードしOrigin取得に使う（handler用）。
func (u *Usecase) DecodeState(state string) (*StatePayload, error) {
	return u.states.Decode(state)
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

func generateCodeVerifier() (string, error) {
	return randomString(64)
}

func codeChallengeS256(verifier string) string {
	sum := sha256.Sum256([]byte(verifier))
	return base64.RawURLEncoding.EncodeToString(sum[:])
}
