package worker

import (
	"testing"
)

type fakeDiscordSender struct {
	calls []string
	err   error
}

func (f *fakeDiscordSender) Send(text string) error {
	f.calls = append(f.calls, text)
	return f.err
}

func TestDiscordWorker_HandleMessage_Success(t *testing.T) {
	sender := &fakeDiscordSender{}
	w := NewDiscordWorker("subject", sender, func(format string, v ...any) {})

	payload := []byte(`{"destination":"dest","userId":"U1","message":"hi","receivedAt":"2025-01-01T00:00:00Z"}`)
	if err := w.handleMessage(payload); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}
	if len(sender.calls) != 1 || sender.calls[0] != "hi" {
		t.Fatalf("unexpected calls: %+v", sender.calls)
	}
}

func TestDiscordWorker_HandleMessage_Empty(t *testing.T) {
	sender := &fakeDiscordSender{}
	w := NewDiscordWorker("subject", sender, func(format string, v ...any) {})

	payload := []byte(`{"destination":"dest","userId":"U1","message":"","receivedAt":"2025-01-01T00:00:00Z"}`)
	if err := w.handleMessage(payload); err == nil {
		t.Fatalf("expected error")
	}
	if len(sender.calls) != 0 {
		t.Fatalf("expected no calls")
	}
}
