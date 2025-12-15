package httpadapter

import (
	"testing"

	"github.com/sngm3741/roots/base/auth/internal/tenant"
)

// テナントloader/parseの最低限のエラー確認。
func TestTenantParseError(t *testing.T) {
	t.Parallel()
	_, err := tenant.Parse([]byte("invalid: ["))
	if err == nil {
		t.Fatalf("want parse error")
	}
}
