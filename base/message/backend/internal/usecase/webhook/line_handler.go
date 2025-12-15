package webhook

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"github.com/sngm3741/roots/base/message/internal/adapter/http/handler"
	"github.com/sngm3741/roots/base/message/internal/domain/lineevent"
)

// LineWebhookHandler はLINE Webhookを受け取りNATSに中継する。
type LineWebhookHandler struct {
	resolver handler.LineWebhookResolver
	maxBody  int64
	logger   func(format string, v ...any)
}

// NewLineWebhookHandler はLINE用ハンドラを初期化する。
func NewLineWebhookHandler(resolver handler.LineWebhookResolver, maxBody int64, logger func(format string, v ...any)) *LineWebhookHandler {
	return &LineWebhookHandler{
		resolver: resolver,
		maxBody:  maxBody,
		logger:   logger,
	}
}

// Router はLINE用のルーターを返す。
func (h *LineWebhookHandler) Router() http.Handler {
	r := chi.NewRouter()
	r.Use(middleware.RequestID)
	r.Use(middleware.RealIP)
	r.Use(middleware.Recoverer)
	r.Use(handler.WithTenant)
	r.Post("/", h.handle)
	return r
}

type lineEventsRequest struct {
	Destination string `json:"destination"`
	Events      []struct {
		Type    string `json:"type"`
		Message *struct {
			Type string `json:"type"`
			ID   string `json:"id"`
			Text string `json:"text"`
		} `json:"message"`
		Source struct {
			Type   string `json:"type"`
			UserID string `json:"userId"`
		} `json:"source"`
	} `json:"events"`
}

var errLineNoEvents = errors.New("line: events empty")

func (h *LineWebhookHandler) handle(w http.ResponseWriter, r *http.Request) {
	tenantID := handler.TenantFromContext(r.Context())
	if tenantID == "" {
		http.Error(w, "tenant is required", http.StatusBadRequest)
		return
	}

	body, err := readBody(r, h.maxBody)
	if err != nil {
		http.Error(w, "failed to read body", http.StatusBadRequest)
		return
	}
	h.logger("LINE body: %s", string(body))

	payload, err := parseLinePayload(body)
	if err != nil {
		if errors.Is(err, errLineNoEvents) {
			w.WriteHeader(http.StatusOK)
			_, _ = w.Write([]byte(`{"status":"ok"}`))
			return
		}
		http.Error(w, "invalid payload", http.StatusBadRequest)
		return
	}

	msg, err := json.Marshal(payload)
	if err != nil {
		h.logger("line payload encode error: %v", err)
		http.Error(w, "internal error", http.StatusInternalServerError)
		return
	}

	deps, err := h.resolver.ResolveLineWebhook(tenantID)
	if err != nil {
		http.Error(w, "unknown tenant", http.StatusBadRequest)
		return
	}

	if err := deps.Producer.Publish(r.Context(), deps.Subject, msg); err != nil {
		h.logger("line publish error: %v", err)
		http.Error(w, "failed to publish", http.StatusBadGateway)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusAccepted)
	_, _ = w.Write([]byte(`{"status":"accepted"}`))
}

func parseLinePayload(body []byte) (*lineevent.Event, error) {
	var req lineEventsRequest
	if err := json.Unmarshal(body, &req); err != nil {
		return nil, err
	}
	if len(req.Events) == 0 {
		return nil, errLineNoEvents
	}
	evt := req.Events[0]
	message := json.RawMessage(nil)
	if evt.Type == "message" && evt.Message != nil {
		msg := map[string]string{
			"message": evt.Message.Text,
		}
		buf, err := json.Marshal(msg)
		if err != nil {
			return nil, fmt.Errorf("encode message: %w", err)
		}
		message = buf
	}
	return lineevent.New(req.Destination, evt.Type, evt.Source.UserID, message, time.Now())
}
