package twitter

import (
	"context"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"

	"github.com/sngm3741/roots/base/auth/internal/domain/twitteruser"
	"github.com/sngm3741/roots/base/auth/internal/usecase/twitterlogin"
)

// Client はTwitter OAuth2 / API 呼び出しを担当するHTTPクライアント。
type Client struct {
	httpClient        *http.Client
	clientID          string
	clientSecret      string
	redirectURI       string
	authorizeEndpoint string
	tokenEndpoint     string
	profileEndpoint   string
	scopes            []string
}

// NewClient はTwitter API クライアントを初期化する。
func NewClient(
	httpClient *http.Client,
	clientID string,
	clientSecret string,
	redirectURI string,
	authorizeEndpoint string,
	tokenEndpoint string,
	profileEndpoint string,
	scopes []string,
) *Client {
	return &Client{
		httpClient:        httpClient,
		clientID:          strings.TrimSpace(clientID),
		clientSecret:      strings.TrimSpace(clientSecret),
		redirectURI:       strings.TrimSpace(redirectURI),
		authorizeEndpoint: strings.TrimSpace(authorizeEndpoint),
		tokenEndpoint:     strings.TrimSpace(tokenEndpoint),
		profileEndpoint:   strings.TrimSpace(profileEndpoint),
		scopes:            append([]string(nil), scopes...),
	}
}

// BuildAuthorizeURL はstate/code_challengeを含めた認可URLを生成する。
func (c *Client) BuildAuthorizeURL(state, codeChallenge string) string {
	values := url.Values{}
	values.Set("response_type", "code")
	values.Set("client_id", c.clientID)
	values.Set("redirect_uri", c.redirectURI)
	values.Set("scope", strings.Join(c.scopes, " "))
	values.Set("state", state)
	values.Set("code_challenge", codeChallenge)
	values.Set("code_challenge_method", "S256")

	return fmt.Sprintf("%s?%s", strings.TrimRight(c.authorizeEndpoint, "/"), values.Encode())
}

// ExchangeToken はauthorization code と code_verifier を使ってトークンを取得する。
func (c *Client) ExchangeToken(ctx context.Context, code, codeVerifier string) (*twitterlogin.Token, error) {
	form := url.Values{}
	form.Set("grant_type", "authorization_code")
	form.Set("code", code)
	form.Set("redirect_uri", c.redirectURI)
	form.Set("code_verifier", codeVerifier)
	form.Set("client_id", c.clientID)

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.tokenEndpoint, strings.NewReader(form.Encode()))
	if err != nil {
		return nil, fmt.Errorf("twitter token: create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	if c.clientSecret != "" {
		credential := base64.StdEncoding.EncodeToString([]byte(c.clientID + ":" + c.clientSecret))
		req.Header.Set("Authorization", "Basic "+credential)
	}

	res, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("twitter token: request failed: %w", err)
	}
	defer res.Body.Close()

	body, err := io.ReadAll(io.LimitReader(res.Body, 1<<20))
	if err != nil {
		return nil, fmt.Errorf("twitter token: read response: %w", err)
	}

	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return nil, fmt.Errorf("twitter token: status %d: %s", res.StatusCode, strings.TrimSpace(string(body)))
	}

	var parsed struct {
		AccessToken  string `json:"access_token"`
		RefreshToken string `json:"refresh_token,omitempty"`
		TokenType    string `json:"token_type"`
		ExpiresIn    int    `json:"expires_in"`
		Scope        string `json:"scope"`
	}
	if err := json.Unmarshal(body, &parsed); err != nil {
		return nil, fmt.Errorf("twitter token: decode response: %w", err)
	}
	if parsed.AccessToken == "" {
		return nil, errors.New("twitter token: missing access_token")
	}

	return &twitterlogin.Token{
		AccessToken:  parsed.AccessToken,
		RefreshToken: parsed.RefreshToken,
		TokenType:    parsed.TokenType,
		ExpiresIn:    parsed.ExpiresIn,
	}, nil
}

// FetchProfile はアクセストークンを使ってプロフィールを取得する。
func (c *Client) FetchProfile(ctx context.Context, accessToken string) (*twitterlogin.Profile, error) {
	profileURL, err := url.Parse(c.profileEndpoint)
	if err != nil {
		return nil, fmt.Errorf("twitter profile: invalid url: %w", err)
	}
	query := profileURL.Query()
	if query.Get("user.fields") == "" {
		query.Set("user.fields", "name,username,profile_image_url")
	}
	profileURL.RawQuery = query.Encode()

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, profileURL.String(), nil)
	if err != nil {
		return nil, fmt.Errorf("twitter profile: create request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)

	res, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("twitter profile: request failed: %w", err)
	}
	defer res.Body.Close()

	body, err := io.ReadAll(io.LimitReader(res.Body, 1<<20))
	if err != nil {
		return nil, fmt.Errorf("twitter profile: read response: %w", err)
	}

	if res.StatusCode < 200 || res.StatusCode >= 300 {
		return nil, fmt.Errorf("twitter profile: status %d: %s", res.StatusCode, strings.TrimSpace(string(body)))
	}

	var payload struct {
		Data struct {
			ID              string `json:"id"`
			Name            string `json:"name"`
			Username        string `json:"username"`
			ProfileImageURL string `json:"profile_image_url"`
		} `json:"data"`
	}
	if err := json.Unmarshal(body, &payload); err != nil {
		return nil, fmt.Errorf("twitter profile: decode response: %w", err)
	}
	if payload.Data.ID == "" {
		return nil, errors.New("twitter profile: missing id")
	}

	tid, err := twitteruser.NewID(payload.Data.ID)
	if err != nil {
		return nil, err
	}

	return &twitterlogin.Profile{
		ID:          tid,
		DisplayName: payload.Data.Name,
		Username:    payload.Data.Username,
		AvatarURL:   payload.Data.ProfileImageURL,
	}, nil
}
