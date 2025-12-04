# base/docker compose 再構築 (ExecPlan)

base/auth・base/message・base/storage を分離コンテナで起動するローカル用 docker-compose を整備し、nginx リバースプロキシを介したマルチテナント検証を可能にする。

## Purpose / Big Picture
- 目的: base 配下サービスをコンテナ起動できる標準 compose を用意し、ローカル検証・CI で再利用できるようにする。
- ゴール: `infra/docker/base/compose.local.yml` で auth/message/storage + 依存（NATS, MinIO, nginx）を起動し、サンプルテナント設定をバンドル。
- スコープ: base/auth backend, base/message backend, base/storage backend, infra/docker/base の compose/nginx/config 追加。

## Progress
- [x] (2025-12-01 12:00) Plan 起票
- [x] (2025-12-01 12:25) compose.local.yml 作成（サービス分割 + NATS/MinIO/nginx）
- [x] (2025-12-01 12:30) サンプルテナント設定追加（auth/message）
- [x] (2025-12-01 12:35) nginx リバースプロキシ設定
- [ ] (YYYY-MM-DD hh:mm) 動作確認（docker compose up; ヘルスチェック）
- [ ] (YYYY-MM-DD hh:mm) リファクタリング & 後片付け

## Surprises & Discoveries
- TBD

## Decision Log
- Decision: 分離コンテナ構成（auth/message/storage を別コンテナ、NATS/MinIO/nginx 共通）。
  - Rationale: 障害・スケール単位を分けやすく、将来のサービス分割に素直。
  - Date/Author: 2025-12-01 / Codex
- Decision: リバプロ設定は環境別に `infra/configs/<env>/reverse-proxy/` へ配置し、compose からマウントする。
  - Rationale: 環境ごとのドメイン/upstream差分を明示し、apps が別VPSでも使い回せるようにする。
  - Date/Author: 2025-12-01 / Codex
- Decision: reverse-proxy のテンプレートを `infra/configs/templates/reverse-proxy/` に用意し、env用はそこから派生させる。
  - Rationale: 新環境追加時の漏れ防止とキー一覧の提示。
  - Date/Author: 2025-12-01 / Codex

## Plan of Work
- compose.local.yml をベースに各サービスの build/context を定義（Go multi-stage）。
- テナント設定のサンプルを `infra/configs/local/base/auth/tenants/local.yaml` 等に配置し、コンテナにマウント。
- nginx で `*.auth.localhost` / `*.message.localhost` / `*.webhook.localhost` / `storage.localhost` をプロキシ。
- MinIO を S3 互換ストレージとして起動（バケット初期化は手動 or 後続対応）。

## Validation and Acceptance
- `docker compose -f infra/docker/base/compose.local.yml up -d` が通ること。
- `curl -H "Host: local.auth.localhost" http://localhost/healthz` 等で 200 が返ること。
- auth/message/storage のコンテナが起動し、設定ファイルがマウントされていること。

## Idempotence and Recovery
- compose で完結するようにし、外部破壊的コマンドは不要。
- バケット初期化など追加作業が必要な場合は別途スクリプト化する。
