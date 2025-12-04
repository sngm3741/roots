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

	payload := []byte(`{"destination":"dest","userId":"U1","message":{"message":"hi"},"receivedAt":"2025-01-01T00:00:00Z"}`)
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

	payload := []byte(`{"destination":"dest","userId":"U1","message":{"message":""},"receivedAt":"2025-01-01T00:00:00Z"}`)
	if err := w.handleMessage(payload); err == nil {
		t.Fatalf("expected error")
	}
	if len(sender.calls) != 0 {
		t.Fatalf("expected no calls")
	}
}

func TestDiscordWorker_HandleMessage_LongText(t *testing.T) {
	sender := &fakeDiscordSender{}
	w := NewDiscordWorker("subject", sender, func(format string, v ...any) {})

	long := make([]byte, 5000)
	for i := range long {
		long[i] = 'a'
	}
	payload := []byte(`{"destination":"dest","userId":"U1","message":{"message":"` + string(long) + `"},"receivedAt":"2025-01-01T00:00:00Z"}`)
	if err := w.handleMessage(payload); err != nil {
		t.Fatalf("unexpected error for long text: %v", err)
	}
	if len(sender.calls) != 1 || len(sender.calls[0]) != len(long) {
		t.Fatalf("unexpected calls length: %v", sender.calls)
	}
}
