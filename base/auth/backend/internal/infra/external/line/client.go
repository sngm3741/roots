package line

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"strings"

	"github.com/sngm3741/roots/base/auth/internal/domain/user"
	"github.com/sngm3741/roots/base/auth/internal/usecase/linelogin"
)

// Client はLINE OAuth / API 呼び出しを担当するHTTPクライアント。
type Client struct {
	httpClient        *http.Client
	channelID         string
	channelSecret     string
	redirectURI       string
	authorizeEndpoint string
	tokenEndpoint     string
	profileEndpoint   string
	scopes            []string
	botPrompt         string
}

// NewClient はLINE API クライアントを初期化する。
func NewClient(httpClient *http.Client, channelID, channelSecret, redirectURI, authorizeEndpoint, tokenEndpoint, profileEndpoint, botPrompt string, scopes []string) *Client {
	return &Client{
		httpClient:        httpClient,
		channelID:         strings.TrimSpace(channelID),
		channelSecret:     strings.TrimSpace(channelSecret),
		redirectURI:       strings.TrimSpace(redirectURI),
		authorizeEndpoint: strings.TrimSpace(authorizeEndpoint),
		tokenEndpoint:     strings.TrimSpace(tokenEndpoint),
		profileEndpoint:   strings.TrimSpace(profileEndpoint),
		scopes:            append([]string(nil), scopes...),
		botPrompt:         strings.TrimSpace(botPrompt),
	}
}

func (c *Client) BuildAuthorizeURL(state string) string {
	values := url.Values{}
	values.Set("response_type", "code")
	values.Set("client_id", c.channelID)
	values.Set("redirect_uri", c.redirectURI)
	values.Set("state", state)
	values.Set("scope", strings.Join(c.scopes, " "))
	if c.botPrompt != "" {
		values.Set("bot_prompt", c.botPrompt)
	}
	return fmt.Sprintf("%s?%s", c.authorizeEndpoint, values.Encode())
}

func (c *Client) ExchangeToken(ctx context.Context, code string) (*linelogin.LineToken, error) {
	form := url.Values{}
	form.Set("grant_type", "authorization_code")
	form.Set("code", code)
	form.Set("redirect_uri", c.redirectURI)
	form.Set("client_id", c.channelID)
	form.Set("client_secret", c.channelSecret)

	req, err := http.NewRequestWithContext(ctx, http.MethodPost, c.tokenEndpoint, strings.NewReader(form.Encode()))
	if err != nil {
		return nil, fmt.Errorf("line token: create request: %w", err)
	}
	req.Header.Set("Content-Type", "application/x-www-form-urlencoded")

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("line token: request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("line token: status %d: %s", resp.StatusCode, string(body))
	}

	var parsed struct {
		AccessToken  string `json:"access_token"`
		ExpiresIn    int    `json:"expires_in"`
		TokenType    string `json:"token_type"`
		IDToken      string `json:"id_token"`
		RefreshToken string `json:"refresh_token"`
		Scope        string `json:"scope"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&parsed); err != nil {
		return nil, fmt.Errorf("line token: decode response: %w", err)
	}
	if parsed.AccessToken == "" {
		return nil, errors.New("line token: missing access_token")
	}

	return &linelogin.LineToken{
		AccessToken: parsed.AccessToken,
		ExpiresIn:   parsed.ExpiresIn,
		TokenType:   parsed.TokenType,
	}, nil
}

func (c *Client) FetchProfile(ctx context.Context, accessToken string) (*linelogin.LineProfile, error) {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, c.profileEndpoint, nil)
	if err != nil {
		return nil, fmt.Errorf("line profile: create request: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+accessToken)

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("line profile: request failed: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		body, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("line profile: status %d: %s", resp.StatusCode, string(body))
	}

	var profile struct {
		UserID        string `json:"userId"`
		DisplayName   string `json:"displayName"`
		PictureURL    string `json:"pictureUrl"`
		StatusMessage string `json:"statusMessage"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&profile); err != nil {
		return nil, fmt.Errorf("line profile: decode response: %w", err)
	}
	lineID, err := user.NewID(profile.UserID)
	if err != nil {
		return nil, err
	}

	return &linelogin.LineProfile{
		ID:          lineID,
		DisplayName: profile.DisplayName,
		AvatarURL:   profile.PictureURL,
	}, nil
}
