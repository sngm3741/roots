package ingress

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/sngm3741/roots/base/message/internal/domain/message"
	"github.com/sngm3741/roots/base/message/internal/infra/nats"
)

// Publisher は宛先ごとにNATSへpublishする。
type Publisher interface {
	Publish(ctx context.Context, subject string, data []byte) error
}

// Subjects は宛先→NATSサブジェクトのマッピング。
type Subjects struct {
	Line    string
	Discord string
}

// Service は送信要求を検証し、適切なサブジェクトにpublishする。
type Service struct {
	publisher   Publisher
	subjects    Subjects
	defaultDest string
}

// NewService は送信サービスを生成する。
func NewService(publisher Publisher, subjects Subjects, defaultDest string) *Service {
	return &Service{
		publisher:   publisher,
		subjects:    subjects,
		defaultDest: defaultDest,
	}
}

// Send は宛先/本文を検証し、NATSにpublishする。
func (s *Service) Send(ctx context.Context, destination, userID, text string) error {
	dest := destination
	if dest == "" {
		dest = s.defaultDest
	}
	msg, err := message.New(dest, userID, text, message.NowUTC())
	if err != nil {
		return err
	}

	subject, err := s.subjectFor(msg.Destination())
	if err != nil {
		return err
	}

	body, err := encodeEnvelope(msg)
	if err != nil {
		return err
	}

	return s.publisher.Publish(ctx, subject, body)
}

func (s *Service) subjectFor(destination string) (string, error) {
	switch destination {
	case "line":
		if s.subjects.Line == "" {
			return "", fmt.Errorf("subject for line is empty")
		}
		return s.subjects.Line, nil
	case "discord":
		if s.subjects.Discord == "" {
			return "", fmt.Errorf("subject for discord is empty")
		}
		return s.subjects.Discord, nil
	default:
		return "", fmt.Errorf("unsupported destination: %s", destination)
	}
}

func encodeEnvelope(msg *message.Message) ([]byte, error) {
	payload := struct {
		Destination string          `json:"destination"`
		UserID      string          `json:"userId"`
		Message     json.RawMessage `json:"message"`
		ReceivedAt  time.Time       `json:"receivedAt"`
	}{
		Destination: msg.Destination(),
		UserID:      msg.UserID(),
		Message:     json.RawMessage(fmt.Sprintf(`{"message":%q}`, msg.Text())),
		ReceivedAt:  msg.ReceivedAt(),
	}
	return json.Marshal(payload)
}

// PublisherImpl はNATS Producerをラップする実装。
type PublisherImpl struct {
	producer nats.Producer
}

// NewPublisherImpl はPublisherImplを生成する。
func NewPublisherImpl(producer nats.Producer) *PublisherImpl {
	return &PublisherImpl{producer: producer}
}

// Publish はNATSへ委譲する。
func (p *PublisherImpl) Publish(ctx context.Context, subject string, data []byte) error {
	return p.producer.Publish(ctx, subject, data)
}
