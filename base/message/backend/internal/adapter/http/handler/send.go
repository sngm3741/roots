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
	"github.com/sngm3741/roots/base/message/internal/usecase/ingress"
)

// SendHandler は外部からの送信要求を受け付ける。
type SendHandler struct {
	service *ingress.Service
	timeout time.Duration
}

// NewSendHandler はSendHandlerを初期化する。
func NewSendHandler(service *ingress.Service, timeout time.Duration) *SendHandler {
	return &SendHandler{service: service, timeout: timeout}
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
	var req sendRequest
	if err := json.NewDecoder(http.MaxBytesReader(w, r.Body, 1<<20)).Decode(&req); err != nil {
		http.Error(w, "invalid request body", http.StatusBadRequest)
		return
	}

	ctx, cancel := h.requestContext(r.Context())
	defer cancel()

	if err := h.service.Send(ctx, req.Destination, req.UserID, req.Text); err != nil {
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

func (h *SendHandler) requestContext(parent context.Context) (context.Context, context.CancelFunc) {
	t := h.timeout
	if t <= 0 {
		t = 5 * time.Second
	}
	return context.WithTimeout(parent, t)
}
