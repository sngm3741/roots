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
	refreshToken string
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
		RefreshToken: f.refreshToken,
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

func TestUsecase_Start_AllowsKnownOrigin(t *testing.T) {
	stateMgr := NewHMACStateManager([]byte("secret"), time.Minute)
	twitter := &fakeTwitterClient{authURL: "https://twitter.example.com/authorize"}
	tokens := &fakeTokenIssuer{token: "app-token"}

	uc := NewUsecase(stateMgr, twitter, tokens, map[string]struct{}{"https://app.example.com": {}}, "")

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
	twitter := &fakeTwitterClient{authURL: "https://twitter.example.com/authorize"}
	tokens := &fakeTokenIssuer{token: "app-token"}

	uc := NewUsecase(stateMgr, twitter, tokens, map[string]struct{}{"https://allowed.example.com": {}}, "")

	if _, err := uc.Start(context.Background(), "https://other.example.com"); err == nil {
		t.Fatalf("expected error for disallowed origin")
	}
}

func TestUsecase_Callback_Success(t *testing.T) {
	stateMgr := NewHMACStateManager([]byte("secret"), time.Minute)
	fixed := time.Date(2025, 1, 1, 0, 0, 0, 0, time.UTC)
	stateMgr.now = func() time.Time { return fixed }

	twitter := &fakeTwitterClient{
		authURL:     "https://twitter.example.com/authorize",
		accessToken: "twitter-access-token",
		profileID:   "123",
		profileName: "Hanako",
		username:    "hanako",
	}
	tokens := &fakeTokenIssuer{token: "app-token"}

	uc := NewUsecase(stateMgr, twitter, tokens, map[string]struct{}{"https://app.example.com": {}}, "https://fallback.example.com")

	startOut, err := uc.Start(context.Background(), "https://app.example.com")
	if err != nil {
		t.Fatalf("Start error: %v", err)
	}
	state := startOut.State

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
	if result.Payload.TwitterUser.ID != "123" || result.Payload.TwitterUser.Username != "hanako" {
		t.Fatalf("unexpected user: %+v", result.Payload.TwitterUser)
	}
}

func TestUsecase_Callback_TokenError(t *testing.T) {
	stateMgr := NewHMACStateManager([]byte("secret"), time.Minute)
	stateMgr.now = func() time.Time { return time.Now().UTC() }
	twitter := &fakeTwitterClient{tokenErr: errors.New("token fail")}
	tokens := &fakeTokenIssuer{token: "app-token"}

	uc := NewUsecase(stateMgr, twitter, tokens, nil, "https://fallback.example.com")

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
