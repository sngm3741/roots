package httpadapter

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"io"
	"log"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/sngm3741/roots/base/auth/internal/usecase/linelogin"
)

// Lineハンドラのリクエスト/レスポンスマッピングをテーブル駆動で検証する。
func TestLineHandler_LoginStart(t *testing.T) {
	t.Parallel()

	mock := &mockLineResolver{
		deps: LineTenantDeps{
			Usecase: &mockLineUsecase{
				startOut: &linelogin.StartOutput{
					AuthorizationURL: "https://auth.example.com",
					State:            "state",
				},
			},
			AllowedOrigins:        map[string]struct{}{"https://app.example.com": {}},
			DefaultRedirectOrigin: "https://app.example.com",
			RedirectPath:          "/done",
		},
	}
	h := NewLineHandler(mock, 2*time.Second, log.New(io.Discard, "", 0))
	tests := []struct {
		name       string
		body       any
		origin     string
		usecaseErr error
		wantStatus int
	}{
		{name: "正常", body: map[string]string{"origin": "https://app.example.com"}, wantStatus: http.StatusOK},
		{name: "Origin未許可で403", body: map[string]string{"origin": "https://bad.example.com"}, wantStatus: http.StatusForbidden},
		{name: "ボディ不正で400", body: "{", wantStatus: http.StatusBadRequest},
		{name: "usecase ErrOriginRequiredで400", body: map[string]string{"origin": ""}, usecaseErr: linelogin.ErrOriginRequired, wantStatus: http.StatusBadRequest},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			mock.deps.Usecase.(*mockLineUsecase).startErr = tt.usecaseErr
			var buf bytes.Buffer
			switch v := tt.body.(type) {
			case string:
				buf.WriteString(v)
			default:
				_ = json.NewEncoder(&buf).Encode(v)
			}
			req := httptest.NewRequest(http.MethodPost, "/", &buf)
			req = req.WithContext(context.WithValue(req.Context(), tenantKey{}, "tenant1"))
			if tt.origin != "" {
				req.Header.Set("Origin", tt.origin)
			}
			rr := httptest.NewRecorder()

			h.handleLoginStart(rr, req)

			if rr.Code != tt.wantStatus {
				t.Fatalf("status=%d want=%d", rr.Code, tt.wantStatus)
			}
		})
	}
}

func TestLineHandler_Callback(t *testing.T) {
	t.Parallel()

	mock := &mockLineResolver{
		deps: LineTenantDeps{
			Usecase: &mockLineUsecase{
				callbackOut: &linelogin.CallbackResult{
					Success: true,
					State:   "state",
					Origin:  "https://app.example.com",
				},
			},
			DefaultRedirectOrigin: "https://app.example.com",
			RedirectPath:          "/done",
		},
	}
	h := NewLineHandler(mock, 2*time.Second, nil)
	h.logger = log.New(io.Discard, "", 0)

	req := httptest.NewRequest(http.MethodGet, "/?state=ok&code=code", nil)
	req = req.WithContext(context.WithValue(req.Context(), tenantKey{}, "tenant1"))
	rr := httptest.NewRecorder()
	h.handleCallback(rr, req)
	if rr.Code != http.StatusSeeOther {
		t.Fatalf("status=%d", rr.Code)
	}

	// usecaseエラーで500
	mock.deps.Usecase.(*mockLineUsecase).callbackErr = errors.New("fail")
	req2 := httptest.NewRequest(http.MethodGet, "/?state=ok&code=code", nil)
	req2 = req2.WithContext(context.WithValue(req2.Context(), tenantKey{}, "tenant1"))
	rr2 := httptest.NewRecorder()
	h.handleCallback(rr2, req2)
	if rr2.Code != http.StatusInternalServerError {
		t.Fatalf("status=%d", rr2.Code)
	}
}

// --- mocks ---

type mockLineResolver struct {
	deps LineTenantDeps
}

func (m *mockLineResolver) ResolveLine(string) (LineTenantDeps, error) { return m.deps, nil }

type mockLineUsecase struct {
	startOut    *linelogin.StartOutput
	startErr    error
	callbackOut *linelogin.CallbackResult
	callbackErr error
}

func (m *mockLineUsecase) Start(context.Context, string) (*linelogin.StartOutput, error) {
	return m.startOut, m.startErr
}
func (m *mockLineUsecase) Callback(context.Context, string, string) (*linelogin.CallbackResult, error) {
	return m.callbackOut, m.callbackErr
}
