package handler

import (
	"context"
	"time"
)

// IngressTenantDeps は送信APIで利用するテナント依存情報をまとめる。
type IngressTenantDeps struct {
	Service IngressService
	Timeout time.Duration
}

// IngressService はSendのみを要求する薄いインターフェース。
type IngressService interface {
	Send(ctx context.Context, destination, userID, text string) error
}

// IngressTenantResolver はテナントIDからIngress用依存を解決する。
type IngressTenantResolver interface {
	ResolveIngress(tenantID string) (IngressTenantDeps, error)
}
