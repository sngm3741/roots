package ingress

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/sngm3741/roots/base/message/internal/domain/message"
)

type fakePublisher struct {
	subjects []string
	data     [][]byte
	err      error
}

func (f *fakePublisher) Publish(ctx context.Context, subject string, data []byte) error {
	f.subjects = append(f.subjects, subject)
	f.data = append(f.data, data)
	return f.err
}

func TestService_Send_DefaultDestination(t *testing.T) {
	// default destination は廃止
}

func TestService_Send_UnknownDestination(t *testing.T) {
	pub := &fakePublisher{}
	svc := NewService(pub, Subjects{Line: "line.events", Discord: "discord.incoming"})

	if err := svc.Send(context.Background(), "unknown", "U1", "hello"); err == nil {
		t.Fatalf("expected error")
	}
}

func TestService_Send_Validation(t *testing.T) {
	pub := &fakePublisher{}
	svc := NewService(pub, Subjects{Line: "line.events", Discord: "discord.incoming"})

	if err := svc.Send(context.Background(), "line", "", "hello"); err == nil {
		t.Fatalf("expected error for empty user")
	}
	if err := svc.Send(context.Background(), "line", "U1", ""); err == nil {
		t.Fatalf("expected error for empty text")
	}
}

func TestService_Send_PropagatesPublisherError(t *testing.T) {
	pub := &fakePublisher{err: errors.New("publish fail")}
	svc := NewService(pub, Subjects{Line: "line.events", Discord: "discord.incoming"})

	if err := svc.Send(context.Background(), "line", "U1", "hello"); err == nil {
		t.Fatalf("expected publisher error")
	}
}

func TestEncodeEnvelope_Format(t *testing.T) {
	now := time.Date(2025, 1, 1, 0, 0, 0, 0, time.UTC)
	msg, _ := message.New("line", "U1", "hello", now)
	body, err := encodeEnvelope(msg)
	if err != nil {
		t.Fatalf("encodeEnvelope error: %v", err)
	}
	if len(body) == 0 {
		t.Fatalf("expected body")
	}
}
