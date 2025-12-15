package handler

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/sngm3741/roots/base/message/internal/domain/message"
)

// SendHandlerのHTTPマッピングをテーブル駆動で検証する。
func TestSendHandler(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name       string
		body       any
		sendErr    error
		tenantID   string
		wantStatus int
	}{
		{name: "正常", body: map[string]string{"destination": "line", "userId": "u1", "text": "hi"}, tenantID: "t1", wantStatus: http.StatusAccepted},
		{name: "tenantなしで400", body: map[string]string{}, tenantID: "", wantStatus: http.StatusBadRequest},
		{name: "バリデーションエラーで400", body: map[string]string{"destination": "", "userId": "u1", "text": "hi"}, tenantID: "t1", sendErr: message.ErrEmptyDestination, wantStatus: http.StatusBadRequest},
		{name: "内部エラーで500", body: map[string]string{"destination": "line", "userId": "u1", "text": "hi"}, tenantID: "t1", sendErr: errors.New("boom"), wantStatus: http.StatusInternalServerError},
		{name: "ボディ不正で400", body: "{", tenantID: "t1", wantStatus: http.StatusBadRequest},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			mockSvc := &mockSendService{err: tt.sendErr}
			resolver := &mockIngressResolver{
				deps: IngressTenantDeps{
					Service: mockSvc,
					Timeout: 2 * time.Second,
				},
			}
			h := NewSendHandler(resolver, 5*time.Second)

			var buf bytes.Buffer
			switch v := tt.body.(type) {
			case string:
				buf.WriteString(v)
			default:
				_ = json.NewEncoder(&buf).Encode(v)
			}

			req := httptest.NewRequest(http.MethodPost, "/send", &buf)
			if tt.tenantID != "" {
				req = req.WithContext(context.WithValue(req.Context(), tenantKey{}, tt.tenantID))
			}
			rr := httptest.NewRecorder()

			h.sendMessage(rr, req)

			if rr.Code != tt.wantStatus {
				t.Fatalf("status=%d want=%d", rr.Code, tt.wantStatus)
			}
		})
	}
}

type mockIngressResolver struct {
	deps IngressTenantDeps
	err  error
}

func (m *mockIngressResolver) ResolveIngress(string) (IngressTenantDeps, error) {
	return m.deps, m.err
}

type mockSendService struct {
	err error
}

func (m *mockSendService) Send(ctx context.Context, destination, userID, text string) error {
	return m.err
}
