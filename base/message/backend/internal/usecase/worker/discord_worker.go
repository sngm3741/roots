package worker

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/nats-io/nats.go"

	"github.com/sngm3741/roots/base/message/internal/infra/discord"
)

// DiscordWorker はDiscord向けメッセージを処理する。
type DiscordWorker struct {
	subject string
	client  discord.Sender
	logger  func(format string, v ...any)
}

// NewDiscordWorker はDiscordWorkerを初期化する。
func NewDiscordWorker(subject string, client discord.Sender, logger func(format string, v ...any)) *DiscordWorker {
	return &DiscordWorker{
		subject: subject,
		client:  client,
		logger:  logger,
	}
}

// Subscribe はNATS購読を開始する。
func (w *DiscordWorker) Subscribe(nc *nats.Conn) error {
	_, err := nc.Subscribe(w.subject, func(msg *nats.Msg) {
		if err := w.handleMessage(msg.Data); err != nil {
			w.logger("discord worker error: %v", err)
		}
	})
	if err != nil {
		return err
	}
	return nc.Flush()
}

type discordPayload struct {
	Destination string    `json:"destination"`
	UserID      string    `json:"userId"`
	Message     json.RawMessage `json:"message"`
	ReceivedAt  time.Time `json:"receivedAt"`
}

func (w *DiscordWorker) handleMessage(data []byte) error {
	var payload discordPayload
	if err := json.Unmarshal(data, &payload); err != nil {
		return fmt.Errorf("decode payload: %w", err)
	}
	text, err := extractDiscordText(payload.Message)
	if err != nil {
		return err
	}
	if text == "" {
		return errors.New("message empty")
	}
	return w.client.Send(text)
}

func (w *DiscordWorker) deliverToDiscord(text string) error {
	return w.client.Send(text)
}

// extractDiscordText は RawMessage から message フィールドを取り出す。
func extractDiscordText(raw json.RawMessage) (string, error) {
	if len(raw) == 0 {
		return "", errors.New("message empty")
	}
	var body struct {
		Message string `json:"message"`
	}
	if err := json.Unmarshal(raw, &body); err != nil {
		return "", err
	}
	return strings.TrimSpace(body.Message), nil
}

// BuildDiscordWorker はDiscordWorker購読をセットアップする。
func BuildDiscordWorker(subject string, nc *nats.Conn, client discord.Sender, logger func(format string, v ...any)) error {
	w := NewDiscordWorker(subject, client, logger)
	return w.Subscribe(nc)
}
