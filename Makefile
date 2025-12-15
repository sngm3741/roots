.PHONY: test test-auth test-message test-storage
.PHONY: local-storage-up local-storage-down
.PHONY: local-message-up local-message-down
.PHONY: encrypt-configs
.PHONY: decrypt-configs
.PHONY: makotoclub-frontend-preview

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

# Message-only 起動（nats + message-ingress + message-worker）
local-message-up:
	@docker compose -f infra/docker/base/compose.local.yml up -d nats message-ingress message-worker

# Message-only 停止
local-message-down:
	@docker compose -f infra/docker/base/compose.local.yml down

# infra/configs 配下の平文 .env / tenants/*.yaml を .enc.env / .enc.yaml に暗号化する
# SOPS_AGE_KEY が未設定なら ~/.age/key.txt か ~/.config/sops/age/keys.txt から読み込む
encrypt-configs:
	@SOPS_CFG=$(ROOT)/.sops.yaml; \
	if [ ! -f $$SOPS_CFG ]; then echo "missing $$SOPS_CFG"; exit 1; fi; \
	if [ -z "$$SOPS_AGE_KEY" ]; then \
	  if [ -f $$HOME/.age/key.txt ]; then export SOPS_AGE_KEY=$$(cat $$HOME/.age/key.txt); \
	  elif [ -f $$HOME/.config/sops/age/keys.txt ]; then export SOPS_AGE_KEY=$$(grep -m1 '^AGE-SECRET-KEY-' $$HOME/.config/sops/age/keys.txt); \
	  else echo "SOPS_AGE_KEY not set and no age key file found"; exit 1; fi; \
	fi; \
	SOPS_CONFIG=$$SOPS_CFG $(ROOT)/infra/scripts/config/encrypt_all.sh

# infra/configs 配下の .enc.env / .enc.yaml を平文に復号する
decrypt-configs:
	@SOPS_CFG=$(ROOT)/.sops.yaml; \
	if [ ! -f $$SOPS_CFG ]; then echo "missing $$SOPS_CFG"; exit 1; fi; \
	if [ -z "$$SOPS_AGE_KEY" ]; then \
	  if [ -f $$HOME/.age/key.txt ]; then export SOPS_AGE_KEY=$$(cat $$HOME/.age/key.txt); \
	  elif [ -f $$HOME/.config/sops/age/keys.txt ]; then export SOPS_AGE_KEY=$$(grep -m1 '^AGE-SECRET-KEY-' $$HOME/.config/sops/age/keys.txt); \
	  else echo "SOPS_AGE_KEY not set and no age key file found"; exit 1; fi; \
	fi; \
	SOPS_CONFIG=$$SOPS_CFG $(ROOT)/infra/scripts/config/decrypt_all.sh

# makotoclub frontend
makotoclub-frontend-preview:
	@cd apps/makotoclub/frontend && npm run preview
