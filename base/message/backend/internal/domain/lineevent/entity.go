package lineevent

import (
	"encoding/json"
	"errors"
	"strings"
	"time"
)

var (
	// ErrInvalidEvent は必須フィールド不足時に返す。
	ErrInvalidEvent = errors.New("lineevent: invalid event")
)

// Event はLINE Webhookから受け取るイベントの標準化フォーマット。
type Event struct {
	destination string
	eventType   string
	userID      string
	message     json.RawMessage
	receivedAt  time.Time
}

// New はイベントを生成する。
func New(destination, eventType, userID string, message json.RawMessage, receivedAt time.Time) (*Event, error) {
	dest := strings.TrimSpace(destination)
	etype := strings.TrimSpace(eventType)
	uid := strings.TrimSpace(userID)
	if etype == "" || uid == "" {
		return nil, ErrInvalidEvent
	}
	return &Event{
		destination: dest,
		eventType:   etype,
		userID:      uid,
		message:     message,
		receivedAt:  receivedAt,
	}, nil
}

// Destination は宛先IDを返す。
func (e *Event) Destination() string {
	return e.destination
}

// EventType はイベント種別を返す。
func (e *Event) EventType() string {
	return e.eventType
}

// UserID はユーザーIDを返す。
func (e *Event) UserID() string {
	return e.userID
}

// Message はメッセージ本文（JSON）を返す。
func (e *Event) Message() json.RawMessage {
	return e.message
}

// ReceivedAt は受信時刻を返す。
func (e *Event) ReceivedAt() time.Time {
	return e.receivedAt
}
