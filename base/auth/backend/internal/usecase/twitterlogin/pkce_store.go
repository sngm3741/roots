package twitterlogin

import "sync"

// verifierStore はstateに紐づくcode_verifierを一時的に保持する。
type verifierStore struct {
	mu   sync.Mutex
	data map[string]string
}

// newVerifierStore は空のストアを生成する。
func newVerifierStore() *verifierStore {
	return &verifierStore{data: make(map[string]string)}
}

// Store はstateに対応するcode_verifierを保存する。
func (s *verifierStore) Store(state, verifier string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.data[state] = verifier
}

// Take はstateに対応するcode_verifierを取得し、ストアから削除する。
func (s *verifierStore) Take(state string) (string, bool) {
	s.mu.Lock()
	defer s.mu.Unlock()
	verifier, ok := s.data[state]
	if ok {
		delete(s.data, state)
	}
	return verifier, ok
}
