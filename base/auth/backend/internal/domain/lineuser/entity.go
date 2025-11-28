package lineuser

import (
	"errors"
	"strings"
)

var (
	// ErrInvalidID はユーザーIDが不正な場合に返される。
	ErrInvalidID = errors.New("lineuser: invalid id")
)

// ID はLINEユーザーを識別するための値オブジェクト。
type ID string

// NewID は空でないIDを生成する。
func NewID(v string) (ID, error) {
	id := ID(strings.TrimSpace(v))
	if id == "" {
		return "", ErrInvalidID
	}
	return id, nil
}

// User はLINE認証で得られるユーザーの集約ルート。
type User struct {
	id          ID
	displayName string
	avatarURL   string
}

// New はユーザーを生成する。
func New(id ID, displayName, avatarURL string) (*User, error) {
	if id == "" {
		return nil, ErrInvalidID
	}
	return &User{
		id:          id,
		displayName: displayName,
		avatarURL:   strings.TrimSpace(avatarURL),
	}, nil
}

func (u *User) ID() ID {
	return u.id
}

// DisplayName は表示名を返す。
func (u *User) DisplayName() string {
	return u.displayName
}

// AvatarURL はアイコンURLを返す。
func (u *User) AvatarURL() string {
	return u.avatarURL
}
