package twitterlogin

import (
	"crypto/hmac"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"errors"
	"fmt"
	"strconv"
	"strings"
	"time"
)

var (
	// ErrInvalidState はstate文字列の検証に失敗した場合に返される。
	ErrInvalidState = errors.New("state: invalid")
	// ErrStateExpired はstateがTTLを超過している場合に返される。
	ErrStateExpired = errors.New("state: expired")
)

// StatePayload はstateに埋め込む情報を表す。
type StatePayload struct {
	IssuedAt time.Time
	Origin   string
	Nonce    string
}

// StateManager はstateの発行・検証の抽象。
type StateManager interface {
	Issue(origin string) (string, *StatePayload, error)
	Verify(state string) (*StatePayload, error)
	Decode(state string) (*StatePayload, error)
}

// HMACStateManager はHMAC署名されたstateを扱う実装。
type HMACStateManager struct {
	secret []byte
	ttl    time.Duration
	now    func() time.Time
}

// NewHMACStateManager はHMACベースのStateManagerを生成する。
func NewHMACStateManager(secret []byte, ttl time.Duration) *HMACStateManager {
	return &HMACStateManager{
		secret: append([]byte(nil), secret...),
		ttl:    ttl,
		now:    func() time.Time { return time.Now().UTC() },
	}
}

// Issue はstate文字列を生成する。
func (m *HMACStateManager) Issue(origin string) (string, *StatePayload, error) {
	nonce, err := randomString(32)
	if err != nil {
		return "", nil, fmt.Errorf("state: failed to generate nonce: %w", err)
	}

	payload := &StatePayload{
		IssuedAt: m.now(),
		Origin:   origin,
		Nonce:    nonce,
	}

	serialized := fmt.Sprintf("%d|%s|%s", payload.IssuedAt.Unix(), origin, nonce)
	mac := hmac.New(sha256.New, m.secret)
	mac.Write([]byte(serialized))
	signature := mac.Sum(nil)

	state := fmt.Sprintf("%s|%s", serialized, base64.RawURLEncoding.EncodeToString(signature))
	return base64.RawURLEncoding.EncodeToString([]byte(state)), payload, nil
}

// Verify はstateの署名検証と期限チェックを行う。
func (m *HMACStateManager) Verify(state string) (*StatePayload, error) {
	payload, err := m.Decode(state)
	if err != nil {
		return nil, err
	}
	if m.now().Sub(payload.IssuedAt) > m.ttl {
		return nil, ErrStateExpired
	}
	return payload, nil
}

// Decode はstateをデコードし、署名の正当性も確認する。
func (m *HMACStateManager) Decode(state string) (*StatePayload, error) {
	decoded, err := base64.RawURLEncoding.DecodeString(state)
	if err != nil {
		return nil, ErrInvalidState
	}
	parts := strings.Split(string(decoded), "|")
	if len(parts) != 4 {
		return nil, ErrInvalidState
	}

	issuedAtRaw, origin, nonce, sigRaw := parts[0], parts[1], parts[2], parts[3]

	expected := fmt.Sprintf("%s|%s|%s", issuedAtRaw, origin, nonce)
	mac := hmac.New(sha256.New, m.secret)
	mac.Write([]byte(expected))
	expectedSig := mac.Sum(nil)

	providedSig, err := base64.RawURLEncoding.DecodeString(sigRaw)
	if err != nil {
		return nil, ErrInvalidState
	}

	if !hmac.Equal(providedSig, expectedSig) {
		return nil, ErrInvalidState
	}

	issuedUnix, err := parseUnix(issuedAtRaw)
	if err != nil {
		return nil, ErrInvalidState
	}

	return &StatePayload{
		IssuedAt: time.Unix(issuedUnix, 0).UTC(),
		Origin:   origin,
		Nonce:    nonce,
	}, nil
}

// randomString は指定バイト長のランダム文字列を生成する。
func randomString(length int) (string, error) {
	buf := make([]byte, length)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	return base64.RawURLEncoding.EncodeToString(buf), nil
}

// parseUnix はUNIXタイム文字列をint64に変換する。
func parseUnix(value string) (int64, error) {
	for _, ch := range value {
		if ch < '0' || ch > '9' {
			return 0, fmt.Errorf("invalid unix timestamp")
		}
	}
	return strconv.ParseInt(value, 10, 64)
}
