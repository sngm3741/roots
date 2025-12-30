.DEFAULT_GOAL := help

.PHONY: help test test-auth test-message test-storage
.PHONY: local-storage-up local-storage-down
.PHONY: local-message-up local-message-down
.PHONY: encrypt-configs
.PHONY: decrypt-configs
.PHONY: makotoclub-frontend-preview makotoclub-admin-preview
.PHONY: makotoclub-d1-backup
.PHONY: git-push

ROOT := $(CURDIR)
GO ?= go
GOCACHE ?= $(ROOT)/.gocache
BACKUP_DIR ?= $(ROOT)/apps/makotoclub/backup
MSG ?= dev

help: ## ヘルプを表示
	@awk 'BEGIN {FS = ":.*## "}; /^[a-zA-Z0-9_-]+:.*## / {printf "  %-28s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

# 全体テスト（auth/message/storage を順に実行）
test: test-auth test-message test-storage ## 全体テスト（auth/message/storage）

# auth
test-auth: ## auth のテスト
	@cd base/auth/backend && GOCACHE=$(GOCACHE) $(GO) test -v ./...

# message
test-message: ## message のテスト
	@cd base/message/backend && GOCACHE=$(GOCACHE) $(GO) test -v ./...

# storage
test-storage: ## storage のテスト
	@cd base/storage/backend && GOCACHE=$(GOCACHE) $(GO) test -v ./...

# Storage-only 起動（minio + storage）
local-storage-up: ## Storage-only 起動（minio + storage）
	@docker compose -f infra/docker/base/compose.local.yml up -d minio storage
	@docker compose -f infra/docker/base/compose.local.yml run --rm mc-init

# Storage-only 停止
local-storage-down: ## Storage-only 停止
	@docker compose -f infra/docker/base/compose.local.yml down

# Message-only 起動（nats + message-ingress + message-worker）
local-message-up: ## Message-only 起動（nats + message-ingress + message-worker）
	@docker compose -f infra/docker/base/compose.local.yml up -d nats message-ingress message-worker

# Message-only 停止
local-message-down: ## Message-only 停止
	@docker compose -f infra/docker/base/compose.local.yml down

# infra/configs 配下の平文 .env / tenants/*.yaml を .enc.env / .enc.yaml に暗号化する
# SOPS_AGE_KEY が未設定なら ~/.age/key.txt か ~/.config/sops/age/keys.txt から読み込む
encrypt-configs: ## infra/configs の .env/.yaml を暗号化
	@SOPS_CFG=$(ROOT)/.sops.yaml; \
	if [ ! -f $$SOPS_CFG ]; then echo "missing $$SOPS_CFG"; exit 1; fi; \
	if [ -z "$$SOPS_AGE_KEY" ]; then \
	  if [ -f $$HOME/.age/key.txt ]; then export SOPS_AGE_KEY=$$(cat $$HOME/.age/key.txt); \
	  elif [ -f $$HOME/.config/sops/age/keys.txt ]; then export SOPS_AGE_KEY=$$(grep -m1 '^AGE-SECRET-KEY-' $$HOME/.config/sops/age/keys.txt); \
	  else echo "SOPS_AGE_KEY not set and no age key file found"; exit 1; fi; \
	fi; \
	SOPS_CONFIG=$$SOPS_CFG $(ROOT)/infra/scripts/config/encrypt_all.sh

# infra/configs 配下の .enc.env / .enc.yaml を平文に復号する
decrypt-configs: ## infra/configs の .enc を復号
	@SOPS_CFG=$(ROOT)/.sops.yaml; \
	if [ ! -f $$SOPS_CFG ]; then echo "missing $$SOPS_CFG"; exit 1; fi; \
	if [ -z "$$SOPS_AGE_KEY" ]; then \
	  if [ -f $$HOME/.age/key.txt ]; then export SOPS_AGE_KEY=$$(cat $$HOME/.age/key.txt); \
	  elif [ -f $$HOME/.config/sops/age/keys.txt ]; then export SOPS_AGE_KEY=$$(grep -m1 '^AGE-SECRET-KEY-' $$HOME/.config/sops/age/keys.txt); \
	  else echo "SOPS_AGE_KEY not set and no age key file found"; exit 1; fi; \
	fi; \
	SOPS_CONFIG=$$SOPS_CFG $(ROOT)/infra/scripts/config/decrypt_all.sh

# makotoclub frontend
makotoclub-frontend-preview: ## makotoclub frontend preview
	@cd apps/makotoclub/frontend && npm run preview

makotoclub-admin-preview: ## makotoclub admin preview
	@cd apps/makotoclub/admin && npm run preview

# MakotoClub D1 バックアップ（本番）
makotoclub-d1-backup: ## MakotoClub D1 バックアップ（本番）
	@mkdir -p $(BACKUP_DIR)
	@backup="$(BACKUP_DIR)/d1-makotoclub-$$(date +%Y%m%d-%H%M%S).sql"; \
	cd $(ROOT)/apps/makotoclub/frontend && npx wrangler d1 export makotoclub --remote --output "$$backup"; \
	echo "$$backup"

# git add/commit/push
git-push: ## git add/commit/push（コミットメッセージは日本語）
	@git add .
	@git commit -m "$(MSG)"
	@git push origin HEAD
