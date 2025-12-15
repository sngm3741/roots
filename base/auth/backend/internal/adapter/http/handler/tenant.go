package httpadapter

import (
	"context"
	"net/http"
	"strings"
)

type tenantKey struct{}

// WithTenant はリクエストのHostからテナントIDを推定し、contextに載せる。
// host例: auth-tenantA.example.com -> tenantA
func WithTenant(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		host := r.Host
		tenant := resolveTenant(host)
		if tenant == "" {
			http.Error(w, "unknown tenant", http.StatusBadRequest)
			return
		}
		ctx := context.WithValue(r.Context(), tenantKey{}, tenant)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

// TenantFromContext は context からテナントIDを取り出す。
func TenantFromContext(ctx context.Context) string {
	if v := ctx.Value(tenantKey{}); v != nil {
		if s, ok := v.(string); ok {
			return s
		}
	}
	return ""
}

func resolveTenant(host string) string {
	host = strings.TrimSpace(host)
	if host == "" {
		return ""
	}
	parts := strings.Split(host, ".")
	if len(parts) == 0 {
		return ""
	}
	// hostの最初のラベルからテナントを取る例: tenantA.example.com -> tenantA
	return parts[0]
}
