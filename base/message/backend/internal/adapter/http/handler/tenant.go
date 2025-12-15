package handler

import (
	"context"
	"net/http"
	"strings"
)

type tenantKey struct{}

// WithTenant はHostヘッダからテナントIDを推定し、contextに格納する。
func WithTenant(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		host := strings.TrimSpace(r.Host)
		tenant := resolveTenant(host)
		if tenant == "" {
			http.Error(w, "unknown tenant", http.StatusBadRequest)
			return
		}
		ctx := context.WithValue(r.Context(), tenantKey{}, tenant)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// TenantFromContext はcontextからテナントIDを取り出す。
func TenantFromContext(ctx context.Context) string {
	if v := ctx.Value(tenantKey{}); v != nil {
		if s, ok := v.(string); ok {
			return s
		}
	}
	return ""
}

func resolveTenant(host string) string {
	if host == "" {
		return ""
	}
	parts := strings.Split(host, ".")
	if len(parts) == 0 {
		return ""
	}
	return parts[0]
}
