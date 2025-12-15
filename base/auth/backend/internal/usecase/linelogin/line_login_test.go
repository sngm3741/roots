package linelogin

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/sngm3741/roots/base/auth/internal/domain/lineuser"
)

type fakeLineClient struct {
	authURL      string
	tokenErr     error
	profileErr   error
	accessToken  string
	profileID    string
	profileName  string
	profileImage string
}

func (f *fakeLineClient) BuildAuthorizeURL(state string) string {
	return f.authURL + "?state=" + state
}

func (f *fakeLineClient) ExchangeToken(ctx context.Context, code string) (*LineToken, error) {
	if f.tokenErr != nil {
		return nil, f.tokenErr
	}
	return &LineToken{
		AccessToken: f.accessToken,
		ExpiresIn:   3600,
		TokenType:   "Bearer",
	}, nil
}

func (f *fakeLineClient) FetchProfile(ctx context.Context, accessToken string) (*LineProfile, error) {
	if f.profileErr != nil {
		return nil, f.profileErr
	}
	id, _ := lineuser.NewID(f.profileID)
	return &LineProfile{
		ID:          id,
		DisplayName: f.profileName,
		AvatarURL:   f.profileImage,
	}, nil
}

type fakeTokenIssuer struct {
	token string
	err   error
}

func (f *fakeTokenIssuer) Issue(u *lineuser.User) (string, int, error) {
	if f.err != nil {
		return "", 0, f.err
	}
	return f.token, 3600, nil
}

// テーブル駆動で Start/Callback の主要分岐を検証。
func TestUsecase_Flows(t *testing.T) {
	t.Parallel()

	stateMgr := NewHMACStateManager([]byte("secret"), time.Minute)
	stateMgr.now = func() time.Time { return time.Date(2025, 1, 1, 0, 0, 0, 0, time.UTC) }

	tests := []struct {
		name        string
		setup       func() *Usecase
		origin      string
		code        string
		state       string
		wantSuccess bool
		wantErr     error
		wantMessage string
	}{
		{
			name: "Start: 許可オリジンで認可URLを返す",
			setup: func() *Usecase {
				return NewUsecase(stateMgr, &fakeLineClient{authURL: "https://line.example"}, &fakeTokenIssuer{token: "app-token"}, map[string]struct{}{"https://allowed": {}}, "")
			},
			origin:      "https://allowed",
			wantSuccess: true,
		},
		{
			name: "Callback: 正常にJWTを返す",
			setup: func() *Usecase {
				return NewUsecase(stateMgr, &fakeLineClient{authURL: "https://line.example", accessToken: "at", profileID: "U123", profileName: "Taro"}, &fakeTokenIssuer{token: "app-token"}, map[string]struct{}{"https://allowed": {}}, "https://fallback")
			},
			state:       mustIssueState(stateMgr, "https://allowed"),
			code:        "code",
			wantSuccess: true,
		},
		{
			name: "Callback: state検証失敗でエラー文言",
			setup: func() *Usecase {
				return NewUsecase(stateMgr, &fakeLineClient{}, &fakeTokenIssuer{}, nil, "https://fallback")
			},
			state:       "invalid",
			code:        "code",
			wantSuccess: false,
			wantMessage: "無効なログイン試行です。再度お試しください。",
		},
		{
			name: "Callback: token取得失敗でリトライ案内",
			setup: func() *Usecase {
				return NewUsecase(stateMgr, &fakeLineClient{tokenErr: errors.New("fail")}, &fakeTokenIssuer{}, nil, "https://fallback")
			},
			state:       mustIssueState(stateMgr, "https://origin"),
			code:        "code",
			wantSuccess: false,
			wantMessage: "LINE認証との通信に失敗しました。時間を置いて再度お試しください。",
		},
	}

	for _, tt := range tests {
		tt := tt
		t.Run(tt.name, func(t *testing.T) {
			t.Parallel()

			uc := tt.setup()
			if tt.code == "" && tt.state == "" {
				out, err := uc.Start(context.Background(), tt.origin)
				if tt.wantErr != nil {
					if err == nil || !errors.Is(err, tt.wantErr) {
						t.Fatalf("expected err %v, got %v", tt.wantErr, err)
					}
					return
				}
				if err != nil {
					t.Fatalf("Start error: %v", err)
				}
				if out.AuthorizationURL == "" || out.State == "" {
					t.Fatalf("missing output: %+v", out)
				}
				return
			}

			res, err := uc.Callback(context.Background(), tt.code, tt.state)
			if tt.wantErr != nil {
				if err == nil || !errors.Is(err, tt.wantErr) {
					t.Fatalf("expected err %v, got %v", tt.wantErr, err)
				}
				return
			}
			if err != nil {
				t.Fatalf("Callback error: %v", err)
			}
			if res.Success != tt.wantSuccess {
				t.Fatalf("success mismatch: %+v", res)
			}
			if tt.wantMessage != "" && res.ErrorMessage != tt.wantMessage {
				t.Fatalf("expected message %q, got %q", tt.wantMessage, res.ErrorMessage)
			}
		})
	}
}

func mustIssueState(m *HMACStateManager, origin string) string {
	state, _, err := m.Issue(origin)
	if err != nil {
		panic(err)
	}
	return state
}
