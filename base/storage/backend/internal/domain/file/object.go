package file

import (
	"errors"
	"strings"
)

var (
	// ErrInvalidContentType は許可されていないContent-Typeの場合に返す。
	ErrInvalidContentType = errors.New("file: invalid content type")
)

// IsAllowedContentType は許可されたContent-Typeプレフィックスかを判定する。
func IsAllowedContentType(ct string, allowed []string) bool {
	if len(allowed) == 0 {
		return true
	}
	ct = strings.TrimSpace(ct)
	if ct == "" {
		return false
	}
	for _, a := range allowed {
		a = strings.TrimSpace(a)
		if a == "" {
			continue
		}
		if strings.HasSuffix(a, "/*") {
			prefix := strings.TrimSuffix(a, "/*")
			if strings.HasPrefix(ct, prefix) {
				return true
			}
		} else if strings.HasPrefix(ct, a) {
			return true
		}
	}
	return false
}
