package nats

import (
	"context"

	"github.com/nats-io/nats.go"
)

// Producer はNATSへメッセージをpublishする。
type Producer interface {
	Publish(ctx context.Context, subject string, data []byte) error
}

type producer struct {
	nc *nats.Conn
}

// NewProducer はProducerを生成する。
func NewProducer(nc *nats.Conn) Producer {
	return &producer{nc: nc}
}

// Publish はNATSにメッセージを送る。
func (p *producer) Publish(ctx context.Context, subject string, data []byte) error {
	return p.nc.Publish(subject, data)
}
