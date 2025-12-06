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

	"github.com/sngm3741/roots/base/auth/internal/usecase/twitterlogin"
)

// Twitterハンドラのリクエスト/レスポンスマッピングをテーブル駆動で検証する。
func TestTwitterHandler_LoginStart(t *testing.T) {
	t.Parallel()

	mock := &mockTwitterResolver{
		deps: TwitterTenantDeps{
			Usecase: &mockTwitterUsecase{
				startOut: &twitterlogin.StartOutput{
					AuthorizationURL: "https://x.example.com",
					State:            "state",
				},
			},
			AllowedOrigins:        map[string]struct{}{"https://app.example.com": {}},
			DefaultRedirectOrigin: "https://app.example.com",
			RedirectPath:          "/done",
		},
	}
	h := NewTwitterHandler(mock, 2*time.Second, log.New(io.Discard, "", 0))

	tests := []struct {
		name       string
		body       any
		usecaseErr error
		wantStatus int
		headerOrigin string
	}{
		{name: "正常", body: map[string]string{"origin": "https://app.example.com"}, wantStatus: http.StatusOK},
		{name: "正常_ヘッダOriginのみ", body: map[string]string{}, headerOrigin: "https://app.example.com", wantStatus: http.StatusOK},
		{name: "origin未許可", body: map[string]string{"origin": "https://bad.example.com"}, wantStatus: http.StatusForbidden},
		{name: "origin空", body: map[string]string{"origin": ""}, wantStatus: http.StatusBadRequest, usecaseErr: twitterlogin.ErrOriginRequired},
		{name: "ボディ不正", body: "{", wantStatus: http.StatusBadRequest},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			mock.deps.Usecase.(*mockTwitterUsecase).startErr = tt.usecaseErr
			var buf bytes.Buffer
			switch v := tt.body.(type) {
			case string:
				buf.WriteString(v)
			default:
				_ = json.NewEncoder(&buf).Encode(v)
			}
			req := httptest.NewRequest(http.MethodPost, "/twitter/login", &buf)
			if tt.headerOrigin != "" {
				req.Header.Set("Origin", tt.headerOrigin)
			}
			req = req.WithContext(context.WithValue(req.Context(), tenantKey{}, "tenant1"))
			rr := httptest.NewRecorder()

			h.handleLoginStart(rr, req)
			if rr.Code != tt.wantStatus {
				t.Fatalf("status=%d want=%d body=%s", rr.Code, tt.wantStatus, rr.Body.String())
			}
		})
	}
}

func TestTwitterHandler_Callback(t *testing.T) {
	t.Parallel()
	mock := &mockTwitterResolver{
		deps: TwitterTenantDeps{
			Usecase: &mockTwitterUsecase{
				callbackOut: &twitterlogin.CallbackResult{
					Success: true,
					State:   "st",
					Origin:  "https://app.example.com",
				},
			},
			DefaultRedirectOrigin: "https://app.example.com",
			RedirectPath:          "/done",
		},
	}
	h := NewTwitterHandler(mock, 2*time.Second, log.New(io.Discard, "", 0))

	req := httptest.NewRequest(http.MethodGet, "/twitter/callback?state=st&code=cd", nil)
	req = req.WithContext(context.WithValue(req.Context(), tenantKey{}, "tenant1"))
	rr := httptest.NewRecorder()
	h.handleCallback(rr, req)
	if rr.Code != http.StatusSeeOther {
		t.Fatalf("status=%d", rr.Code)
	}

	mock.deps.Usecase.(*mockTwitterUsecase).callbackErr = errors.New("fail")
	req2 := httptest.NewRequest(http.MethodGet, "/twitter/callback?state=st&code=cd", nil)
	req2 = req2.WithContext(context.WithValue(req2.Context(), tenantKey{}, "tenant1"))
	rr2 := httptest.NewRecorder()
	h.handleCallback(rr2, req2)
	if rr2.Code != http.StatusInternalServerError {
		t.Fatalf("status=%d", rr2.Code)
	}
}

// --- mocks ---

type mockTwitterResolver struct {
	deps TwitterTenantDeps
}

func (m *mockTwitterResolver) ResolveTwitter(string) (TwitterTenantDeps, error) { return m.deps, nil }

type mockTwitterUsecase struct {
	startOut    *twitterlogin.StartOutput
	startErr    error
	callbackOut *twitterlogin.CallbackResult
	callbackErr error
}

func (m *mockTwitterUsecase) Start(context.Context, string) (*twitterlogin.StartOutput, error) {
	return m.startOut, m.startErr
}
func (m *mockTwitterUsecase) Callback(context.Context, string, string) (*twitterlogin.CallbackResult, error) {
	return m.callbackOut, m.callbackErr
}
func (m *mockTwitterUsecase) DecodeState(string) (*twitterlogin.StatePayload, error) { return nil, nil }
