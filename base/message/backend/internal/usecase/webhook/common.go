package webhook

import (
	"io"
	"net/http"
)

// readBody はリクエストボディを最大サイズまで読み取る。
func readBody(r *http.Request, max int64) ([]byte, error) {
	defer r.Body.Close()
	return io.ReadAll(io.LimitReader(r.Body, max))
}
