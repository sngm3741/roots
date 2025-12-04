package handler

import (
	"context"
	"net/http"
	"strings"
)

// WithTenantOrDefault はHostから解決し、空ならデフォルトテナントを使う。
func WithTenantOrDefault(defaultTenant string) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			host := strings.TrimSpace(r.Host)
			tenant := resolveTenant(host)
			if tenant == "" {
				tenant = strings.TrimSpace(defaultTenant)
			}
			if tenant == "" {
				http.Error(w, "unknown tenant", http.StatusBadRequest)
				return
			}
			ctx := context.WithValue(r.Context(), tenantKey{}, tenant)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
