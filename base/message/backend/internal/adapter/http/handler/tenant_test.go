package handler

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"
)

// テナント解決のテーブル駆動テスト。
func TestWithTenant(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name     string
		host     string
		want     string
		wantCode int
	}{
		{"hostからtenant抽出", "tenant1.example.com", "tenant1", 0},
		{"空ホストで400", "", "", http.StatusBadRequest},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			var got string
			next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				got = TenantFromContext(r.Context())
			})
			req := httptest.NewRequest(http.MethodGet, "/", nil)
			req.Host = tt.host
			rr := httptest.NewRecorder()

			WithTenant(next).ServeHTTP(rr, req)

			if tt.wantCode != 0 && rr.Code != tt.wantCode {
				t.Fatalf("status=%d want=%d", rr.Code, tt.wantCode)
			}
			if tt.wantCode == 0 && got != tt.want {
				t.Fatalf("tenant=%s want=%s", got, tt.want)
			}
		})
	}
}

func TestTenantFromContext(t *testing.T) {
	t.Parallel()
	ctx := context.WithValue(context.Background(), tenantKey{}, "abc")
	if got := TenantFromContext(ctx); got != "abc" {
		t.Fatalf("tenant=%s", got)
	}
}
