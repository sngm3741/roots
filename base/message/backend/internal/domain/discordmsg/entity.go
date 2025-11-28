package discordmsg

import (
	"errors"
	"strings"
	"time"
)

var (
	// ErrInvalidMessage は本文が不正な場合に返す。
	ErrInvalidMessage = errors.New("discordmsg: invalid message")
)

// Message はDiscord送信用の標準化メッセージ。
type Message struct {
	destination string
	userID      string
	content     string
	receivedAt  time.Time
}

// New はメッセージを生成する。
func New(destination, userID, content string, receivedAt time.Time) (*Message, error) {
	dst := strings.TrimSpace(destination)
	uid := strings.TrimSpace(userID)
	text := strings.TrimSpace(content)
	if text == "" {
		return nil, ErrInvalidMessage
	}
	return &Message{
		destination: dst,
		userID:      uid,
		content:     text,
		receivedAt:  receivedAt,
	}, nil
}

// Destination は宛先を返す。
func (m *Message) Destination() string {
	return m.destination
}

// UserID はユーザーIDを返す。
func (m *Message) UserID() string {
	return m.userID
}

// Content は本文を返す。
func (m *Message) Content() string {
	return m.content
}

// ReceivedAt は受信時刻を返す。
func (m *Message) ReceivedAt() time.Time {
	return m.receivedAt
}
