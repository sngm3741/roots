package worker

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/nats-io/nats.go"

	"github.com/sngm3741/roots/base/message/internal/infra/line"
)

// LineWorker はLINE宛メッセージを処理する。
type LineWorker struct {
	subject string
	client  line.Pusher
	logger  func(format string, v ...any)
}

// NewLineWorker はLineWorkerを初期化する。
func NewLineWorker(subject string, client line.Pusher, logger func(format string, v ...any)) *LineWorker {
	return &LineWorker{
		subject: subject,
		client:  client,
		logger:  logger,
	}
}

// Subscribe はNATSの購読を開始する。
func (w *LineWorker) Subscribe(nc *nats.Conn) error {
	_, err := nc.Subscribe(w.subject, func(msg *nats.Msg) {
		if err := w.handleMessage(msg.Data); err != nil {
			w.logger("line worker error: %v", err)
		}
	})
	if err != nil {
		return err
	}
	return nc.Flush()
}

func (w *LineWorker) handleMessage(data []byte) error {
	var payload lineeventPayload
	if err := json.Unmarshal(data, &payload); err != nil {
		return fmt.Errorf("decode payload: %w", err)
	}
	text, err := extractLineText(payload.Message)
	if err != nil {
		return err
	}
	return w.client.Push(payload.UserID, text)
}

type lineeventPayload struct {
	Destination string          `json:"destination"`
	EventType   string          `json:"eventType"`
	UserID      string          `json:"userId"`
	Message     json.RawMessage `json:"message"`
	ReceivedAt  time.Time       `json:"receivedAt"`
}

func extractLineText(raw json.RawMessage) (string, error) {
	if len(raw) == 0 {
		return "", errors.New("message empty")
	}
	var body struct {
		Message string `json:"message"`
	}
	if err := json.Unmarshal(raw, &body); err != nil {
		return "", err
	}
	if strings.TrimSpace(body.Message) == "" {
		return "", errors.New("message content empty")
	}
	return body.Message, nil
}

// BuildLineWorker はLineWorker購読をセットアップする。
func BuildLineWorker(subject string, nc *nats.Conn, client line.Pusher, logger func(format string, v ...any)) error {
	w := NewLineWorker(subject, client, logger)
	return w.Subscribe(nc)
}
