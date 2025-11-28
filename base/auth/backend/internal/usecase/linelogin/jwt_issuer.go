package linelogin

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"time"

	"github.com/sngm3741/roots/base/auth/internal/domain/user"
)

// TokenIssuer はアプリケーション用トークンの発行を抽象化する。
type TokenIssuer interface {
	Issue(u *user.User) (string, int, error)
}

// JWTIssuer はHS256でJWTを発行する実装。
type JWTIssuer struct {
	secret    []byte
	issuer    string
	audience  string
	expiresIn time.Duration
	now       func() time.Time
}

// NewJWTIssuer はJWTIssuerを生成する。
func NewJWTIssuer(secret []byte, issuer, audience string, expiresIn time.Duration) *JWTIssuer {
	return &JWTIssuer{
		secret:    append([]byte(nil), secret...),
		issuer:    issuer,
		audience:  audience,
		expiresIn: expiresIn,
		now:       func() time.Time { return time.Now().UTC() },
	}
}

func (i *JWTIssuer) Issue(u *user.User) (string, int, error) {
	if len(i.secret) == 0 {
		return "", 0, fmt.Errorf("token issuer: secret is empty")
	}

	now := i.now()
	expiry := now.Add(i.expiresIn)

	header := map[string]any{
		"alg": "HS256",
		"typ": "JWT",
	}
	payload := map[string]any{
		"sub": u.ID(),
		"iss": i.issuer,
		"iat": now.Unix(),
		"exp": expiry.Unix(),
	}
	if name := u.DisplayName(); name != "" {
		payload["name"] = name
	}
	if picture := u.AvatarURL(); picture != "" {
		payload["picture"] = picture
	}
	if i.audience != "" {
		payload["aud"] = i.audience
	}

	headerJSON, err := json.Marshal(header)
	if err != nil {
		return "", 0, fmt.Errorf("token issuer: marshal header: %w", err)
	}
	payloadJSON, err := json.Marshal(payload)
	if err != nil {
		return "", 0, fmt.Errorf("token issuer: marshal payload: %w", err)
	}

	unsigned := base64.RawURLEncoding.EncodeToString(headerJSON) + "." + base64.RawURLEncoding.EncodeToString(payloadJSON)
	mac := hmac.New(sha256.New, i.secret)
	mac.Write([]byte(unsigned))
	signature := base64.RawURLEncoding.EncodeToString(mac.Sum(nil))

	return unsigned + "." + signature, int(i.expiresIn.Seconds()), nil
}
