# base/message services rebuild (Phase 3: messenger-line / messenger-discord)

旧 `__before/base-services/messenger-service/` を Project Roots の新アーキテクチャ/DDD/config_rules に準拠して再構築するためのExecPlan。Phase3では messenger-line / messenger-discord を対象とする。

## Purpose / Big Picture

- 目的: LINE/Discordメッセージングを新4レイヤー構造に移植し、base/message として提供する。
- 完了後: apps から共通メッセージ送信基盤として利用可能。
- 動作確認イメージ: `go test ./...`（ユニット）、`go run ./cmd/api` → `/line/webhook`, `/discord/webhook`, `/send` 等のエンドポイントを確認。

## Progress

- [x] (2025-11-29 23:00) 既存コード・docs の調査完了
- [x] (2025-11-29 23:20) DDD観点での設計方針を固める（Webhook/Worker分割、NATS経由）
- [x] (2025-11-29 23:40) domain 層の実装（lineevent/discordmsg）
- [x] (2025-11-29 23:50) usecase 層の実装（LINE webhook→NATS publish、LINE/Discord workerで送信）
- [x] (2025-11-29 23:55) adapter 層の実装（ベースrouter、LINE webhookハンドラ）
- [x] (2025-11-29 23:58) infra 層の実装（NATS producer）
- [x] (2025-11-29 23:59) テスト & 動作確認（go test ./... ビルド確認）
- [ ] (YYYY-MM-DD hh:mm) リファクタリング & 後片付け

## Surprises & Discoveries

- Observation: ...
  - Evidence: ...
  - Files: ...

## Decision Log

- Decision: Webhook/API と Worker を別エントリポイント（例: `cmd/webhook`, `cmd/worker`）に分割し、Dockerも分ける。NATS経由で疎結合にする。
  - Rationale: 旧構成がWebhook/Worker/NATSを分割しており、受信・送信のスケール/障害分離を保つため。コードは共通ライブラリ化しつつプロセス分離を維持する。
  - Date/Author: 2025-11-29 / taiichi
- Decision: 外部API送信（Ingress）は `cmd/ingress` として専用エントリポイントを持ち、宛先(line/discord)をNATS subjectにマッピングしてpublishする。
  - Rationale: 旧 messenger-ingress の役割をDDDに沿って分離し、送信経路を一元化するため。
  - Date/Author: 2025-11-29 / taiichi
- Decision: HTTPクライアント処理は usecase から排除し、infra/line と infra/discord に送信クライアントを配置してDIする。
  - Rationale: レイヤー責務を明確化し、将来のリトライ/監視をinfra側で扱いやすくするため。
  - Date/Author: 2025-11-29 / taiichi

## Outcomes & Retrospective

- Achieved:
- Remaining:
- Lessons:

## Context and Orientation

- 対象: base/message backend（messenger-line / messenger-discord）
- 参照 docs:
  - `docs/architecture.md`
  - `docs/development.md`
  - `docs/config_rules.md`
  - `docs/ddd/index.md`, `docs/ddd/layers/*`, `docs/ddd/modeling/*`, `docs/ddd/rules/data-access.md`
- 先行 ExecPlan: `docs/DEVLOG/2025-11-29_base-refactor.md`（Phase1 auth-line）, `docs/DEVLOG/2025-11-29_base-auth-twitter.md`（Phase2）
- 旧コード: `__before/base-services/messenger-service/messenger-line/**`, `__before/base-services/messenger-service/messenger-discord/**`

## Plan of Work

- 旧 messenger-line / messenger-discord の挙動・API・env を調査。
- DDDマッピング策定：
  - domain: メッセージ/送信先/署名検証（line signature / discord webhook token 等）
  - usecase: Webhook受信、メッセージ送信、キューイングがあれば整理
  - adapter: HTTPハンドラ（Webhook/送信API）
  - infra: LINE Messaging API / Discord Webhook/REST クライアント
  - cmd: DI/サーバ起動、configロード
- ディレクトリ/Goモジュール生成（base/message/backend 配下）。
- Config/envテンプレの追加（AUTH_MESSAGE_LINE_*, AUTH_MESSAGE_DISCORD_* 等）。
- 実装順:
  1. Configローダー + envテンプレ
  2. domain (メッセージ/署名検証)
  3. usecase (Webhook/送信フロー)
  4. infra (LINE/Discordクライアント)
  5. adapter (HTTP)
  6. cmd (DI)
  7. テスト（署名検証、usecase）
- 最終確認: `go test ./...` + 手動Webhook/送信の確認メモ。

## Concrete Steps

- 作業ディレクトリ: `base/message/backend`
- コマンド例:
  - `go test ./...`
  - `go run ./cmd/api`
  - `curl -X POST http://localhost:8080/line/webhook ...`

## Validation and Acceptance

- `go test ./...` が通ること。
- Webhook署名検証が旧挙動と等価であること（LINE/Discord）。
- メッセージ送信API（必要なら）で旧挙動を維持すること。

## Idempotence and Recovery

- ステップは再実行可。コード生成/DIのみでDB変更なし。
- 失敗時は差分を確認しながらやり直す（破壊的コマンドは禁止）。

## Artifacts and Notes

- 旧コード: `__before/base-services/messenger-service/messenger-line/`, `.../messenger-discord/`
