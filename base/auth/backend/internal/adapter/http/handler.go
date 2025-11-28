package httpadapter

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"html/template"
	"io"
	"log"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"github.com/sngm3741/roots/base/auth/internal/usecase/linelogin"
)

// Handler はHTTP経由のLINEログイン入口をまとめる。
type Handler struct {
	usecase         *linelogin.Usecase
	allowedOrigins  map[string]struct{}
	redirectBuilder *RedirectBuilder
	logger          *log.Logger
	httpTimeout     time.Duration
}

// NewHandler はHTTPハンドラを初期化する。
func NewHandler(
	usecase *linelogin.Usecase,
	allowedOrigins map[string]struct{},
	defaultRedirectOrigin string,
	redirectPath string,
	httpTimeout time.Duration,
	logger *log.Logger,
) *Handler {
	copiedOrigins := make(map[string]struct{}, len(allowedOrigins))
	for k, v := range allowedOrigins {
		copiedOrigins[k] = v
	}
	return &Handler{
		usecase:         usecase,
		allowedOrigins:  copiedOrigins,
		redirectBuilder: NewRedirectBuilder(defaultRedirectOrigin, redirectPath),
		logger:          logger,
		httpTimeout:     httpTimeout,
	}
}

// Routes はルーターを組み立てて返す。
func (h *Handler) Routes() http.Handler {
	router := chi.NewRouter()
	router.Use(middleware.RequestID)
	router.Use(middleware.RealIP)
	router.Use(middleware.Recoverer)
	router.Use(middleware.Timeout(30 * time.Second))
	router.Use(middleware.RequestLogger(&middleware.DefaultLogFormatter{
		Logger:  h.logger,
		NoColor: true,
	}))

	router.Get("/healthz", h.handleHealthz)
	router.Options("/line/login", h.handlePreflight)
	router.Post("/line/login", h.handleLoginStart)
	router.Get("/line/callback", h.handleCallback)

	return router
}

func (h *Handler) handleHealthz(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet && r.Method != http.MethodHead {
		w.Header().Set("Allow", "GET, HEAD")
		http.Error(w, "method not allowed", http.StatusMethodNotAllowed)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	if r.Method == http.MethodHead {
		w.WriteHeader(http.StatusOK)
		return
	}
	_, _ = io.WriteString(w, `{"status":"ok"}`)
}

func (h *Handler) handlePreflight(w http.ResponseWriter, r *http.Request) {
	origin := r.Header.Get("Origin")
	if !h.isOriginAllowed(origin) {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}
	h.applyCORSHeaders(w, origin)
	w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type")
	w.WriteHeader(http.StatusNoContent)
}

type loginRequest struct {
	Origin string `json:"origin"`
}

type loginResponse struct {
	AuthorizationURL string `json:"authorizationUrl"`
	State            string `json:"state"`
}

// handleLoginStart はログイン開始要求を受け付け、認可URLとstateを返す。
func (h *Handler) handleLoginStart(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()

	headerOrigin := r.Header.Get("Origin")

	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.logger.Printf("failed to decode login request: %v", err)
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	origin := strings.TrimSpace(req.Origin)
	if origin == "" {
		origin = strings.TrimSpace(headerOrigin)
	}

	if origin != "" && !h.isOriginAllowed(origin) {
		h.logger.Printf("login start rejected: origin %q not allowed", origin)
		http.Error(w, "origin not allowed", http.StatusForbidden)
		return
	}
	if origin == "" {
		http.Error(w, "origin is required", http.StatusBadRequest)
		return
	}

	h.applyCORSHeaders(w, origin)

	ctx, cancel := context.WithTimeout(r.Context(), h.httpTimeout)
	defer cancel()

	out, err := h.usecase.Start(ctx, origin)
	if err != nil {
		if errors.Is(err, linelogin.ErrOriginNotAllowed) {
			http.Error(w, "origin not allowed", http.StatusForbidden)
			return
		}
		if errors.Is(err, linelogin.ErrOriginRequired) {
			http.Error(w, "origin is required", http.StatusBadRequest)
			return
		}
		h.logger.Printf("failed to start login: %v", err)
		http.Error(w, "failed to start login", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	if err := json.NewEncoder(w).Encode(loginResponse{
		AuthorizationURL: out.AuthorizationURL,
		State:            out.State,
	}); err != nil {
		h.logger.Printf("failed to encode login response: %v", err)
	}
}

func (h *Handler) handleCallback(w http.ResponseWriter, r *http.Request) {
	ctx, cancel := context.WithTimeout(r.Context(), h.httpTimeout)
	defer cancel()

	stateParam := r.URL.Query().Get("state")
	code := r.URL.Query().Get("code")

	result, err := h.usecase.Callback(ctx, code, stateParam)
	if err != nil {
		h.logger.Printf("callback handling failed: %v", err)
		http.Error(w, "failed to handle callback", http.StatusInternalServerError)
		return
	}

	loginRes := loginResult{
		Type:    loginResultMessageType,
		Success: result.Success,
		State:   result.State,
		Origin:  result.Origin,
	}
	if result.Payload != nil {
		loginRes.Payload = &loginResultPayload{
			AccessToken: result.Payload.AccessToken,
			TokenType:   result.Payload.TokenType,
			ExpiresIn:   result.Payload.ExpiresIn,
			LineUser: loginLineUser{
				UserID:      result.Payload.LineUser.ID,
				DisplayName: result.Payload.LineUser.DisplayName,
				AvatarURL:   result.Payload.LineUser.AvatarURL,
			},
		}
	}
	if !result.Success && result.ErrorMessage != "" {
		loginRes.Error = result.ErrorMessage
	}

	target, err := h.redirectBuilder.Build(loginRes)
	if err != nil {
		h.logger.Printf("failed to build redirect URL: %v", err)
		h.renderFallbackPage(w, loginRes)
		return
	}

	http.Redirect(w, r, target, http.StatusSeeOther)
}

const loginResultMessageType = "line-login-result"

type loginResult struct {
	Type    string              `json:"type"`
	Success bool                `json:"success"`
	State   string              `json:"state,omitempty"`
	Origin  string              `json:"origin,omitempty"`
	Error   string              `json:"error,omitempty"`
	Payload *loginResultPayload `json:"payload,omitempty"`
}

type loginResultPayload struct {
	AccessToken string        `json:"accessToken"`
	TokenType   string        `json:"tokenType"`
	ExpiresIn   int           `json:"expiresIn"`
	LineUser    loginLineUser `json:"lineUser"`
}

type loginLineUser struct {
	UserID      string `json:"userId"`
	DisplayName string `json:"displayName"`
	AvatarURL   string `json:"avatarUrl,omitempty"`
}

// RedirectBuilder はログイン結果をフラグメントに詰めたリダイレクトURLを組み立てる。
type RedirectBuilder struct {
	defaultOrigin string
	redirectPath  string
}

// NewRedirectBuilder はリダイレクト先とパスの組を初期化する。
func NewRedirectBuilder(defaultOrigin, redirectPath string) *RedirectBuilder {
	redirectPath = strings.TrimSpace(redirectPath)
	if redirectPath == "" {
		redirectPath = "/"
	}
	if !strings.HasPrefix(redirectPath, "/") {
		redirectPath = "/" + redirectPath
	}
	return &RedirectBuilder{
		defaultOrigin: strings.TrimSpace(defaultOrigin),
		redirectPath:  redirectPath,
	}
}

func (b *RedirectBuilder) Build(result loginResult) (string, error) {
	origin := strings.TrimSpace(result.Origin)
	if origin == "" {
		origin = b.defaultOrigin
	}
	if origin == "" {
		return "", fmt.Errorf("redirect origin is empty")
	}

	base, err := url.Parse(origin)
	if err != nil {
		return "", fmt.Errorf("invalid redirect origin %q: %w", origin, err)
	}

	base.Path = b.redirectPath
	base.RawQuery = ""

	data, err := json.Marshal(result)
	if err != nil {
		return "", fmt.Errorf("failed to marshal login result: %w", err)
	}

	encoded := base64.RawURLEncoding.EncodeToString(data)
	base.Fragment = "line-login=" + encoded

	return base.String(), nil
}

func (h *Handler) renderFallbackPage(w http.ResponseWriter, result loginResult) {
	message := "LINEログインが完了しました。元の画面に戻ってください。"
	if !result.Success && result.Error != "" {
		message = result.Error
	}

	var linkHTML string
	if h.redirectBuilder.defaultOrigin != "" {
		link := strings.TrimRight(h.redirectBuilder.defaultOrigin, "/") + h.redirectBuilder.redirectPath
		linkHTML = fmt.Sprintf(
			`<p><a href="%s">こちらをタップしてトップページに戻ってください。</a></p>`,
			template.HTMLEscapeString(link),
		)
	}

	page := fmt.Sprintf(`<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="utf-8" />
    <title>LINE ログイン</title>
    <style>
      body { font-family: system-ui, sans-serif; padding: 24px; text-align: center; background: #f8fafc; color: #0f172a; }
      a { color: #ec4899; font-weight: 600; text-decoration: none; }
    </style>
  </head>
  <body>
    <p>%s</p>
    %s
  </body>
</html>`,
		template.HTMLEscapeString(message),
		linkHTML,
	)

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	_, _ = io.WriteString(w, page)
}

func (h *Handler) isOriginAllowed(origin string) bool {
	if origin == "" {
		return false
	}
	if len(h.allowedOrigins) == 0 {
		return true
	}
	_, ok := h.allowedOrigins[origin]
	return ok
}

// applyCORSHeaders は許可済みオリジンに対してCORSレスポンスヘッダを付与する。
func (h *Handler) applyCORSHeaders(w http.ResponseWriter, origin string) {
	if !h.isOriginAllowed(origin) {
		return
	}
	w.Header().Set("Access-Control-Allow-Origin", origin)
	w.Header().Set("Vary", "Origin")
}
