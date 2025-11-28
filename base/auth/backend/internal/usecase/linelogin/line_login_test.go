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

func TestUsecase_Start_AllowsKnownOrigin(t *testing.T) {
	stateMgr := NewHMACStateManager([]byte("secret"), time.Minute)
	line := &fakeLineClient{authURL: "https://line.example.com/authorize"}
	tokens := &fakeTokenIssuer{token: "app-token"}

	uc := NewUsecase(stateMgr, line, tokens, map[string]struct{}{"https://app.example.com": {}}, "")

	out, err := uc.Start(context.Background(), "https://app.example.com")
	if err != nil {
		t.Fatalf("Start error: %v", err)
	}
	if out.AuthorizationURL == "" || out.State == "" {
		t.Fatalf("unexpected output: %+v", out)
	}
}

func TestUsecase_Start_RejectsUnknownOrigin(t *testing.T) {
	stateMgr := NewHMACStateManager([]byte("secret"), time.Minute)
	line := &fakeLineClient{authURL: "https://line.example.com/authorize"}
	tokens := &fakeTokenIssuer{token: "app-token"}

	uc := NewUsecase(stateMgr, line, tokens, map[string]struct{}{"https://allowed.example.com": {}}, "")

	if _, err := uc.Start(context.Background(), "https://other.example.com"); err == nil {
		t.Fatalf("expected error for disallowed origin")
	}
}

func TestUsecase_Callback_Success(t *testing.T) {
	stateMgr := NewHMACStateManager([]byte("secret"), time.Minute)
	fixed := time.Date(2025, 1, 1, 0, 0, 0, 0, time.UTC)
	stateMgr.now = func() time.Time { return fixed }

	line := &fakeLineClient{
		authURL:     "https://line.example.com/authorize",
		accessToken: "line-access-token",
		profileID:   "U123",
		profileName: "Taro",
	}
	tokens := &fakeTokenIssuer{token: "app-token"}

	uc := NewUsecase(stateMgr, line, tokens, map[string]struct{}{"https://app.example.com": {}}, "https://fallback.example.com")

	state, _, err := stateMgr.Issue("https://app.example.com")
	if err != nil {
		t.Fatalf("issue state: %v", err)
	}

	result, err := uc.Callback(context.Background(), "auth-code", state)
	if err != nil {
		t.Fatalf("Callback error: %v", err)
	}
	if !result.Success {
		t.Fatalf("expected success, got failure: %+v", result)
	}
	if result.Payload == nil || result.Payload.AccessToken != "app-token" {
		t.Fatalf("unexpected payload: %+v", result.Payload)
	}
	if result.Payload.LineUser.ID != "U123" {
		t.Fatalf("unexpected user id: %+v", result.Payload.LineUser)
	}
}

func TestUsecase_Callback_TokenError(t *testing.T) {
	stateMgr := NewHMACStateManager([]byte("secret"), time.Minute)
	stateMgr.now = func() time.Time { return time.Now().UTC() }
	line := &fakeLineClient{tokenErr: errors.New("token fail")}
	tokens := &fakeTokenIssuer{token: "app-token"}

	uc := NewUsecase(stateMgr, line, tokens, nil, "https://fallback.example.com")

	state, _, _ := stateMgr.Issue("https://app.example.com")

	result, err := uc.Callback(context.Background(), "auth-code", state)
	if err != nil {
		t.Fatalf("Callback error: %v", err)
	}
	if result.Success {
		t.Fatalf("expected failure, got success")
	}
	if result.ErrorMessage == "" {
		t.Fatalf("expected error message")
	}
}
