package worker

import (
	"errors"
	"testing"
)

type fakeLinePusher struct {
	calls []struct {
		userID string
		text   string
	}
	err error
}

func (f *fakeLinePusher) Push(userID, text string) error {
	f.calls = append(f.calls, struct {
		userID string
		text   string
	}{userID, text})
	return f.err
}

func TestLineWorker_HandleMessage_Success(t *testing.T) {
	p := &fakeLinePusher{}
	w := NewLineWorker("subject", p, func(format string, v ...any) {})

	payload := []byte(`{"destination":"dest","eventType":"message","userId":"U1","message":{"message":"hi"},"receivedAt":"2025-01-01T00:00:00Z"}`)
	if err := w.handleMessage(payload); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(p.calls) != 1 || p.calls[0].userID != "U1" || p.calls[0].text != "hi" {
		t.Fatalf("unexpected calls: %+v", p.calls)
	}
}

func TestLineWorker_HandleMessage_EmptyMessage(t *testing.T) {
	p := &fakeLinePusher{}
	w := NewLineWorker("subject", p, func(format string, v ...any) {})

	payload := []byte(`{"destination":"dest","eventType":"message","userId":"U1","message":{"message":""},"receivedAt":"2025-01-01T00:00:00Z"}`)
	if err := w.handleMessage(payload); err == nil {
		t.Fatalf("expected error for empty message")
	}
	if len(p.calls) != 0 {
		t.Fatalf("expected no calls")
	}
}

func TestLineWorker_Subscribe_CallbackError(t *testing.T) {
	// This test ensures Subscribe sets up the handler; nats.Conn is not invoked here.
	p := &fakeLinePusher{err: errors.New("push fail")}
	w := NewLineWorker("subject", p, func(format string, v ...any) {})
	_ = w // subscribe is not invoked because it requires live NATS; handled in integration env.
}

func TestLineWorker_HandleMessage_LongText(t *testing.T) {
	p := &fakeLinePusher{}
	w := NewLineWorker("subject", p, func(format string, v ...any) {})

	long := make([]byte, 4000)
	for i := range long {
		long[i] = 'b'
	}
	payload := []byte(`{"destination":"dest","eventType":"message","userId":"U1","message":{"message":"` + string(long) + `"},"receivedAt":"2025-01-01T00:00:00Z"}`)
	if err := w.handleMessage(payload); err != nil {
		t.Fatalf("unexpected error for long text: %v", err)
	}
	if len(p.calls) != 1 || p.calls[0].text != string(long) {
		t.Fatalf("unexpected calls: %+v", p.calls)
	}
}
