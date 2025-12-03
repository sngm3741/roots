package httpadapter

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"

	"github.com/sngm3741/roots/base/auth/internal/usecase/twitterlogin"
)

// TwitterHandler はTwitterログインのHTTP境界をまとめる。
type TwitterHandler struct {
	resolver    TwitterTenantResolver
	logger      *log.Logger
	httpTimeout time.Duration
}

// NewTwitterHandler はTwitter用ハンドラを初期化する。
func NewTwitterHandler(
	resolver TwitterTenantResolver,
	httpTimeout time.Duration,
	logger *log.Logger,
) *TwitterHandler {
	return &TwitterHandler{
		resolver:    resolver,
		logger:      logger,
		httpTimeout: httpTimeout,
	}
}

// RegisterRoutes はルーターにTwitter用エンドポイントを登録する。
func (h *TwitterHandler) RegisterRoutes(r chi.Router) {
	r.Options("/twitter/login", h.handlePreflight)
	r.Post("/twitter/login", h.handleLoginStart)
	r.Get("/twitter/callback", h.handleCallback)
}

func (h *TwitterHandler) depsFromRequest(w http.ResponseWriter, r *http.Request) (TwitterTenantDeps, error) {
	tenantID := TenantFromContext(r.Context())
	if strings.TrimSpace(tenantID) == "" {
		http.Error(w, "tenant is required", http.StatusBadRequest)
		return TwitterTenantDeps{}, errors.New("tenant missing")
	}
	deps, err := h.resolver.ResolveTwitter(tenantID)
	if err != nil {
		if errors.Is(err, ErrTwitterDisabled) {
			http.Error(w, "twitter auth is disabled for this tenant", http.StatusNotFound)
			return TwitterTenantDeps{}, err
		}
		http.Error(w, "unknown tenant", http.StatusBadRequest)
		return TwitterTenantDeps{}, err
	}
	return deps, nil
}

type twitterLoginRequest struct {
	Origin string `json:"origin"`
}

type twitterLoginResponse struct {
	AuthorizationURL string `json:"authorizationUrl"`
	State            string `json:"state"`
}

// handleLoginStart はログイン開始要求を受け付け、認可URLとstateを返す。
func (h *TwitterHandler) handleLoginStart(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	deps, err := h.depsFromRequest(w, r)
	if err != nil {
		return
	}

	headerOrigin := r.Header.Get("Origin")

	var req twitterLoginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.logger.Printf("failed to decode twitter login request: %v", err)
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	origin := strings.TrimSpace(req.Origin)
	if origin == "" {
		origin = strings.TrimSpace(headerOrigin)
	}

	if origin != "" && !h.isOriginAllowed(deps.AllowedOrigins, origin) {
		h.logger.Printf("twitter login start rejected: origin %q not allowed", origin)
		http.Error(w, "origin not allowed", http.StatusForbidden)
		return
	}
	if origin == "" {
		http.Error(w, "origin is required", http.StatusBadRequest)
		return
	}

	h.applyCORSHeaders(deps.AllowedOrigins, w, origin)

	ctx, cancel := context.WithTimeout(r.Context(), h.httpTimeout)
	defer cancel()

	out, err := deps.Usecase.Start(ctx, origin)
	if err != nil {
		if errors.Is(err, twitterlogin.ErrOriginNotAllowed) {
			http.Error(w, "origin not allowed", http.StatusForbidden)
			return
		}
		if errors.Is(err, twitterlogin.ErrOriginRequired) {
			http.Error(w, "origin is required", http.StatusBadRequest)
			return
		}
		h.logger.Printf("failed to start twitter login: %v", err)
		http.Error(w, "failed to start login", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(twitterLoginResponse{
		AuthorizationURL: out.AuthorizationURL,
		State:            out.State,
	}); err != nil {
		h.logger.Printf("failed to encode twitter login response: %v", err)
	}
}

// handleCallback はTwitterのコールバックを処理し、リダイレクトを返す。
func (h *TwitterHandler) handleCallback(w http.ResponseWriter, r *http.Request) {
	deps, err := h.depsFromRequest(w, r)
	if err != nil {
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), h.httpTimeout)
	defer cancel()

	stateParam := r.URL.Query().Get("state")
	code := r.URL.Query().Get("code")

	if errorCode := r.URL.Query().Get("error"); errorCode != "" {
		errorDescription := r.URL.Query().Get("error_description")
		h.logger.Printf("Twitter login returned error: %s (%s)", errorCode, errorDescription)
		result := twitterLoginResult{
			Type:    twitterLoginResultMessageType,
			Success: false,
			State:   stateParam,
			Error:   fmt.Sprintf("X認証がキャンセルされました: %s", errorCode),
		}
		if payload, err := deps.Usecase.DecodeState(stateParam); err == nil {
			result.Origin = payload.Origin
		}
		builder := NewRedirectBuilder(deps.DefaultRedirectOrigin, deps.RedirectPath)
		h.redirectWithResult(w, r, result, builder, deps.Usecase.DecodeState)
		return
	}

	result, err := deps.Usecase.Callback(ctx, code, stateParam)
	if err != nil {
		h.logger.Printf("twitter callback handling failed: %v", err)
		http.Error(w, "failed to handle callback", http.StatusInternalServerError)
		return
	}

	loginRes := twitterLoginResult{
		Type:    twitterLoginResultMessageType,
		Success: result.Success,
		State:   result.State,
		Origin:  result.Origin,
	}
	if result.Payload != nil {
		loginRes.Payload = &twitterLoginResultPayload{
			AccessToken: result.Payload.AccessToken,
			TokenType:   result.Payload.TokenType,
			ExpiresIn:   result.Payload.ExpiresIn,
			TwitterUser: twitterLoginUser{
				UserID:      result.Payload.TwitterUser.ID,
				Username:    result.Payload.TwitterUser.Username,
				DisplayName: result.Payload.TwitterUser.DisplayName,
				AvatarURL:   result.Payload.TwitterUser.AvatarURL,
			},
		}
	}
	if !result.Success && result.ErrorMessage != "" {
		loginRes.Error = result.ErrorMessage
	}

	builder := NewRedirectBuilder(deps.DefaultRedirectOrigin, deps.RedirectPath)
	h.redirectWithResult(w, r, loginRes, builder, deps.Usecase.DecodeState)
}

// handlePreflight はCORSプリフライトを処理する。
func (h *TwitterHandler) handlePreflight(w http.ResponseWriter, r *http.Request) {
	deps, err := h.depsFromRequest(w, r)
	if err != nil {
		return
	}
	origin := r.Header.Get("Origin")
	if !h.isOriginAllowed(deps.AllowedOrigins, origin) {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}
	h.applyCORSHeaders(deps.AllowedOrigins, w, origin)
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.WriteHeader(http.StatusNoContent)
}

const twitterLoginResultMessageType = "oauth-login-result"

type twitterLoginResult struct {
	Type    string                     `json:"type"`
	Success bool                       `json:"success"`
	State   string                     `json:"state,omitempty"`
	Origin  string                     `json:"origin,omitempty"`
	Error   string                     `json:"error,omitempty"`
	Payload *twitterLoginResultPayload `json:"payload,omitempty"`
}

type twitterLoginResultPayload struct {
	AccessToken string           `json:"accessToken"`
	TokenType   string           `json:"tokenType"`
	ExpiresIn   int              `json:"expiresIn"`
	TwitterUser twitterLoginUser `json:"twitterUser"`
}

type twitterLoginUser struct {
	UserID      string `json:"userId"`
	Username    string `json:"username"`
	DisplayName string `json:"displayName"`
	AvatarURL   string `json:"avatarUrl,omitempty"`
}

// redirectWithResult は結果をフラグメントに載せてリダイレクトする。
func (h *TwitterHandler) redirectWithResult(
	w http.ResponseWriter,
	r *http.Request,
	result twitterLoginResult,
	builder *RedirectBuilder,
	decodeState func(string) (*twitterlogin.StatePayload, error),
) {
	target, err := h.buildRedirectURL(result, builder, decodeState)
	if err != nil {
		h.logger.Printf("failed to build twitter redirect URL: %v", err)
		h.renderFallbackPage(w, result, builder)
		return
	}
	http.Redirect(w, r, target, http.StatusSeeOther)
}

func (h *TwitterHandler) buildRedirectURL(
	result twitterLoginResult,
	builder *RedirectBuilder,
	decodeState func(string) (*twitterlogin.StatePayload, error),
) (string, error) {
	origin := strings.TrimSpace(result.Origin)
	if origin == "" && result.State != "" && decodeState != nil {
		if payload, err := decodeState(result.State); err == nil {
			origin = payload.Origin
		}
	}
	if origin == "" {
		origin = builder.defaultOrigin
	}
	if origin == "" {
		return "", fmt.Errorf("redirect origin is empty")
	}

	base, err := url.Parse(origin)
	if err != nil {
		return "", fmt.Errorf("invalid redirect origin %q: %w", origin, err)
	}

	base.Path = builder.redirectPath
	base.RawQuery = ""

	data, err := json.Marshal(result)
	if err != nil {
		return "", fmt.Errorf("failed to marshal login result: %w", err)
	}

	encoded := base64.RawURLEncoding.EncodeToString(data)
	base.Fragment = "oauth-login=" + encoded

	return base.String(), nil
}

func (h *TwitterHandler) renderFallbackPage(w http.ResponseWriter, result twitterLoginResult, builder *RedirectBuilder) {
	message := "Xログインが完了しました。元の画面に戻ってください。"
	if !result.Success && result.Error != "" {
		message = result.Error
	}

	var linkHTML string
	if builder.defaultOrigin != "" {
		link := strings.TrimRight(builder.defaultOrigin, "/") + builder.redirectPath
		linkHTML = fmt.Sprintf(
			`<p><a href="%s">こちらをタップして戻ってください。</a></p>`,
			template.HTMLEscapeString(link),
		)
	}

	html := fmt.Sprintf(
		`<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <title>X認証</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <style>
      body { font-family: sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f8fafc; }
      .card { padding: 24px; border-radius: 16px; background: white; box-shadow: 0 12px 30px rgba(15, 23, 42, 0.12); max-width: 360px; text-align: center; }
      h1 { font-size: 20px; margin-bottom: 12px; color: #0f172a; }
      p { font-size: 14px; color: #334155; }
      a { color: #1d9bf0; text-decoration: none; }
      a:hover { text-decoration: underline; }
    </style>
  </head>
  <body>
    <div class="card">
      <h1>X認証</h1>
      <p>%s</p>
      %s
    </div>
  </body>
</html>`,
		template.HTMLEscapeString(message),
		linkHTML,
	)

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte(html))
}

func (h *TwitterHandler) isOriginAllowed(allowed map[string]struct{}, origin string) bool {
	if origin == "" {
		return false
	}
	if len(allowed) == 0 {
		return true
	}
	_, ok := allowed[origin]
	return ok
}

// applyCORSHeaders は許可済みオリジンに対してCORSレスポンスヘッダを付与する。
func (h *TwitterHandler) applyCORSHeaders(allowed map[string]struct{}, w http.ResponseWriter, origin string) {
	if !h.isOriginAllowed(allowed, origin) {
		return
	}
	w.Header().Set("Access-Control-Allow-Origin", origin)
	w.Header().Set("Vary", "Origin")
}
