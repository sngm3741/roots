package discord

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
)

// Sender はDiscord Webhookへメッセージを送信するポート実装。
type Sender interface {
	Send(text string) error
}

type sender struct {
	webhookURL string
	username   string
	avatarURL  string
	client     *http.Client
}

// NewSender はDiscord Webhook送信クライアントを生成する。
func NewSender(webhookURL, username, avatarURL string, timeout time.Duration) Sender {
	return &sender{
		webhookURL: strings.TrimSpace(webhookURL),
		username:   strings.TrimSpace(username),
		avatarURL:  strings.TrimSpace(avatarURL),
		client:     &http.Client{Timeout: timeout},
	}
}

func (s *sender) Send(text string) error {
	payload := map[string]any{
		"content": text,
		"allowed_mentions": map[string]any{
			"parse": []string{},
		},
	}
	if s.username != "" {
		payload["username"] = s.username
	}
	if s.avatarURL != "" {
		payload["avatar_url"] = s.avatarURL
	}

	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("discord: encode payload: %w", err)
	}
	req, err := http.NewRequest(http.MethodPost, s.webhookURL, bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("discord: new request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	res, err := s.client.Do(req)
	if err != nil {
		return fmt.Errorf("discord: request failed: %w", err)
	}
	defer res.Body.Close()

	if res.StatusCode >= 400 {
		return fmt.Errorf("discord: status=%d", res.StatusCode)
	}
	return nil
}
