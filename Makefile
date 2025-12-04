.PHONY: test test-auth test-message test-storage
.PHONY: local-storage-up local-storage-down

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

# Storage-only 起動（minio + storage）
local-storage-up:
	@docker compose -f infra/docker/base/compose.local.yml up -d minio storage
	@docker compose -f infra/docker/base/compose.local.yml run --rm mc-init

# Storage-only 停止
local-storage-down:
	@docker compose -f infra/docker/base/compose.local.yml down
