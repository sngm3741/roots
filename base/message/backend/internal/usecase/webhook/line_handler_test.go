package webhook

import (
	"errors"
	"testing"
	"time"
)

func TestParseLinePayload(t *testing.T) {
	now := time.Now()
	body := []byte(`{
		"destination": "dest",
		"events": [{
			"type": "message",
			"message": {"type":"text","id":"1","text":"hello"},
			"source": {"type":"user","userId":"U123"}
		}]
	}`)

	ev, err := parseLinePayload(body)
	if err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if ev.Destination() != "dest" {
		t.Fatalf("destination mismatch: %s", ev.Destination())
	}
	if ev.EventType() != "message" {
		t.Fatalf("event type mismatch: %s", ev.EventType())
	}
	if ev.UserID() != "U123" {
		t.Fatalf("user id mismatch: %s", ev.UserID())
	}
	if len(ev.Message()) == 0 {
		t.Fatalf("expected message content")
	}
	if ev.ReceivedAt().IsZero() || ev.ReceivedAt().Before(now) {
		t.Fatalf("unexpected ReceivedAt: %v", ev.ReceivedAt())
	}
}

func TestParseLinePayload_NoEvents(t *testing.T) {
	body := []byte(`{"destination": "dest", "events": []}`)
	_, err := parseLinePayload(body)
	if !errors.Is(err, errLineNoEvents) {
		t.Fatalf("expected errLineNoEvents, got %v", err)
	}
}

func TestParseLinePayload_InvalidJSON(t *testing.T) {
	body := []byte(`{invalid`)
	if _, err := parseLinePayload(body); err == nil {
		t.Fatalf("expected error")
	}
}
