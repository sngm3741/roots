package handler

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"github.com/sngm3741/roots/base/message/internal/domain/message"
)

// SendHandler は外部からの送信要求を受け付ける。
type SendHandler struct {
	resolver IngressTenantResolver
	timeout  time.Duration
}

// NewSendHandler はSendHandlerを初期化する。
func NewSendHandler(resolver IngressTenantResolver, timeout time.Duration) *SendHandler {
	return &SendHandler{resolver: resolver, timeout: timeout}
}

// Router は /send を登録したルーターを返す。
func (h *SendHandler) Router() http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Recoverer)
	r.Post("/send", h.sendMessage)
	return r
}

type sendRequest struct {
	Destination string `json:"destination,omitempty"`
	UserID      string `json:"userId"`
	Text        string `json:"text"`
}

func (h *SendHandler) sendMessage(w http.ResponseWriter, r *http.Request) {
	tenantID := TenantFromContext(r.Context())
	if tenantID == "" {
		http.Error(w, "tenant is required", http.StatusBadRequest)
		return
	}

	var req sendRequest
	if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<20)).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	deps, err := h.resolver.ResolveIngress(tenantID)
	if err != nil {
		http.Error(w, "unknown tenant", http.StatusBadRequest)
		return
	}

	ctx, cancel := h.requestContext(r.Context(), deps.Timeout)
	defer cancel()

	if err := deps.Service.Send(ctx, req.Destination, req.UserID, req.Text); err != nil {
		switch {
		case errors.Is(err, message.ErrEmptyDestination),
			errors.Is(err, message.ErrEmptyUserID),
			errors.Is(err, message.ErrEmptyText):
			http.Error(w, err.Error(), http.StatusBadRequest)
		default:
			http.Error(w, "internal error", http.StatusInternalServerError)
		}
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusAccepted)
	_ = json.NewEncoder(w).Encode(map[string]string{"status": "accepted"})
}

func (h *SendHandler) requestContext(parent context.Context, override time.Duration) (context.Context, context.CancelFunc) {
	t := override
	if t <= 0 {
		t = h.timeout
	}
	if t <= 0 {
		t = 5 * time.Second
	}
	return context.WithTimeout(parent, t)
}
