package twitteruser

import (
	"errors"
	"strings"
)

var (
	// ErrInvalidID はユーザーIDが不正な場合に返される。
	ErrInvalidID = errors.New("twitteruser: invalid id")
)

// ID はTwitterユーザーを識別するための値オブジェクト。
type ID string

// NewID は空でないIDを生成する。
func NewID(v string) (ID, error) {
	id := ID(strings.TrimSpace(v))
	if id == "" {
		return "", ErrInvalidID
	}
	return id, nil
}

// User はTwitter OAuthで得られるユーザーの集約ルート。
type User struct {
	id          ID
	username    string
	displayName string
	avatarURL   string
}

// New はユーザーを生成する。
func New(id ID, username, displayName, avatarURL string) (*User, error) {
	if id == "" {
		return nil, ErrInvalidID
	}
	return &User{
		id:          id,
		username:    strings.TrimSpace(username),
		displayName: strings.TrimSpace(displayName),
		avatarURL:   strings.TrimSpace(avatarURL),
	}, nil
}

// ID はユーザーIDを返す。
func (u *User) ID() ID {
	return u.id
}

// Username はハンドル（@なし）を返す。
func (u *User) Username() string {
	return u.username
}

// DisplayName は表示名を返す。
func (u *User) DisplayName() string {
	return u.displayName
}

// AvatarURL はアイコンURLを返す。
func (u *User) AvatarURL() string {
	return u.avatarURL
}
