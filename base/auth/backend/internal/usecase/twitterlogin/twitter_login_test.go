package twitterlogin

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/sngm3741/roots/base/auth/internal/domain/twitteruser"
)

type fakeTwitterClient struct {
	authURL      string
	tokenErr     error
	profileErr   error
	accessToken  string
	profileID    string
	profileName  string
	username     string
	profileImage string
}

func (f *fakeTwitterClient) BuildAuthorizeURL(state, codeChallenge string) string {
	return f.authURL + "?state=" + state + "&code_challenge=" + codeChallenge
}

func (f *fakeTwitterClient) ExchangeToken(ctx context.Context, code, codeVerifier string) (*Token, error) {
	if f.tokenErr != nil {
		return nil, f.tokenErr
	}
	return &Token{
		AccessToken:  f.accessToken,
		RefreshToken: "",
		TokenType:    "Bearer",
		ExpiresIn:    3600,
	}, nil
}

func (f *fakeTwitterClient) FetchProfile(ctx context.Context, accessToken string) (*Profile, error) {
	if f.profileErr != nil {
		return nil, f.profileErr
	}
	id, _ := twitteruser.NewID(f.profileID)
	return &Profile{
		ID:          id,
		DisplayName: f.profileName,
		Username:    f.username,
		AvatarURL:   f.profileImage,
	}, nil
}

type fakeTokenIssuer struct {
	token string
	err   error
}

func (f *fakeTokenIssuer) Issue(u *twitteruser.User) (string, int, error) {
	if f.err != nil {
		return "", 0, f.err
	}
	return f.token, 3600, nil
}

// Startのテーブル駆動テスト。
func TestUsecase_Start(t *testing.T) {
	t.Parallel()
	tests := []struct {
		name    string
		origin  string
		wantErr error
	}{
		{
			name:   "許可オリジンで成功",
			origin: "https://allowed",
		},
		{
			name:    "未指定でエラー",
			origin:  "",
			wantErr: ErrOriginRequired,
		},
		{
			name:    "未許可でエラー",
			origin:  "https://denied",
			wantErr: ErrOriginNotAllowed,
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()
			uc := NewUsecase(newStateMgr(), &fakeTwitterClient{authURL: "https://twitter.example"}, &fakeTokenIssuer{token: "app-token"}, map[string]struct{}{"https://allowed": {}}, "")
			out, err := uc.Start(context.Background(), tt.origin)
			if tt.wantErr != nil {
				if err == nil || !errors.Is(err, tt.wantErr) {
					t.Fatalf("expected %v, got %v", tt.wantErr, err)
				}
				return
			}
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if out.AuthorizationURL == "" || out.State == "" {
				t.Fatalf("missing output: %+v", out)
			}
		})
	}
}

// Callbackの主要分岐をテーブル駆動で検証。
func TestUsecase_Callback(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name        string
		client      *fakeTwitterClient
		token       *fakeTokenIssuer
		stateOrigin string
		code        string
		state       string
		wantSuccess bool
		wantMsg     string
	}{
		{
			name: "正常にJWTを返す",
			client: &fakeTwitterClient{
				authURL:     "https://twitter.example",
				accessToken: "at",
				profileID:   "123",
				profileName: "Hanako",
				username:    "hana",
			},
			token:       &fakeTokenIssuer{token: "app-token"},
			stateOrigin: "https://allowed",
			wantSuccess: true,
		},
		{
			name:    "state検証失敗",
			client:  &fakeTwitterClient{},
			token:   &fakeTokenIssuer{},
			state:   "invalid",
			code:    "code",
			wantMsg: "無効なログイン試行です。再度お試しください。",
		},
		{
			name:        "token取得失敗",
			client:      &fakeTwitterClient{tokenErr: errors.New("fail")},
			token:       &fakeTokenIssuer{},
			stateOrigin: "https://origin",
			wantMsg:     "X認証との通信に失敗しました。時間を置いて再度お試しください。",
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			m := newStateMgr()
			uc := NewUsecase(m, tt.client, tt.token, map[string]struct{}{"https://allowed": {}, "https://origin": {}}, "https://fallback")

			state := tt.state
			if state == "" {
				out, err := uc.Start(context.Background(), tt.stateOrigin)
				if err != nil {
					t.Fatalf("Start error: %v", err)
				}
				state = out.State
			}

			code := tt.code
			if code == "" {
				code = "code"
			}

			res, err := uc.Callback(context.Background(), code, state)
			if err != nil {
				t.Fatalf("Callback error: %v", err)
			}
			if res.Success != tt.wantSuccess {
				t.Fatalf("success mismatch: %+v", res)
			}
			if tt.wantMsg != "" && res.ErrorMessage != tt.wantMsg {
				t.Fatalf("expected message %q, got %q", tt.wantMsg, res.ErrorMessage)
			}
		})
	}
}

func mustState(m *HMACStateManager, origin string) string {
	state, _, err := m.Issue(origin)
	if err != nil {
		panic(err)
	}
	return state
}

func newStateMgr() *HMACStateManager {
	m := NewHMACStateManager([]byte("secret"), time.Minute)
	m.now = func() time.Time { return time.Date(2025, 1, 1, 0, 0, 0, 0, time.UTC) }
	return m
}
