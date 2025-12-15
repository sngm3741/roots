package message

import (
	"errors"
	"strings"
	"time"
)

var (
	// ErrEmptyDestination は宛先が空の場合に返す。
	ErrEmptyDestination = errors.New("message: destination is required")
	// ErrEmptyUserID はuserIDが空の場合に返す。
	ErrEmptyUserID = errors.New("message: userId is required")
	// ErrEmptyText は本文が空の場合に返す。
	ErrEmptyText = errors.New("message: text is required")
)

// Message は送信要求を表す。
type Message struct {
	destination string
	userID      string
	text        string
	receivedAt  time.Time
}

// New は送信要求を生成する。
func New(destination, userID, text string, receivedAt time.Time) (*Message, error) {
	dest := strings.TrimSpace(destination)
	if dest == "" {
		return nil, ErrEmptyDestination
	}
	uid := strings.TrimSpace(userID)
	if uid == "" {
		return nil, ErrEmptyUserID
	}
	body := strings.TrimSpace(text)
	if body == "" {
		return nil, ErrEmptyText
	}
	ts := receivedAt
	if ts.IsZero() {
		ts = time.Now().UTC()
	} else {
		ts = ts.UTC()
	}
	return &Message{
		destination: dest,
		userID:      uid,
		text:        body,
		receivedAt:  ts,
	}, nil
}

// NowUTC は現在時刻をUTCで返す。
func NowUTC() time.Time {
	return time.Now().UTC()
}

// Destination は宛先を返す。
func (m *Message) Destination() string { return m.destination }

// UserID はユーザーIDを返す。
func (m *Message) UserID() string { return m.userID }

// Text は本文を返す。
func (m *Message) Text() string { return m.text }

// ReceivedAt は受信時刻を返す。
func (m *Message) ReceivedAt() time.Time { return m.receivedAt }
