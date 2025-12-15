package handler

import "github.com/sngm3741/roots/base/message/internal/infra/nats"

// LineWebhookDeps はWebhook処理に必要なテナント依存情報。
type LineWebhookDeps struct {
	Producer nats.Producer
	Subject  string
}

// LineWebhookResolver はテナントIDからWebhook依存を解決する。
type LineWebhookResolver interface {
	ResolveLineWebhook(tenantID string) (LineWebhookDeps, error)
}
