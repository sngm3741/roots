.PHONY: test test-auth test-message test-storage

ROOT := $(CURDIR)
GO ?= go
GOCACHE ?= $(ROOT)/.gocache

# 全体テスト（auth/message/storage を順に実行）
test: test-auth test-message test-storage

# auth
test-auth:
	@cd base/auth/backend && GOCACHE=$(GOCACHE) $(GO) test -v ./...

# message
test-message:
	@cd base/message/backend && GOCACHE=$(GOCACHE) $(GO) test -v ./...

# storage
test-storage:
	@cd base/storage/backend && GOCACHE=$(GOCACHE) $(GO) test -v ./...
