package line

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"
)

// Pusher はLINE Messaging APIへメッセージを送信するポート実装。
type Pusher interface {
	Push(userID, text string) error
}

type pusher struct {
	endpoint string
	token    string
	client   *http.Client
}

// NewPusher はLINE Push APIクライアントを生成する。
func NewPusher(endpoint, channelToken string, timeout time.Duration) Pusher {
	return &pusher{
		endpoint: strings.TrimSpace(endpoint),
		token:    strings.TrimSpace(channelToken),
		client:   &http.Client{Timeout: timeout},
	}
}

func (p *pusher) Push(userID, text string) error {
	if userID == "" {
		return fmt.Errorf("line push: userId empty")
	}
	body := map[string]any{
		"to": userID,
		"messages": []map[string]string{{
			"type": "text",
			"text": text,
		}},
	}
	b, err := json.Marshal(body)
	if err != nil {
		return fmt.Errorf("line push: encode body: %w", err)
	}
	req, err := http.NewRequest(http.MethodPost, p.endpoint, bytes.NewReader(b))
	if err != nil {
		return fmt.Errorf("line push: new request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+p.token)

	res, err := p.client.Do(req)
	if err != nil {
		return fmt.Errorf("line push: request failed: %w", err)
	}
	defer res.Body.Close()

	if res.StatusCode >= 400 {
		return fmt.Errorf("line push: status %d", res.StatusCode)
	}
	return nil
}
