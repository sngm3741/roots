# base/storage refactor (upload-service migration)

旧 `__before/base-services/upload-service` を Project Roots の新アーキテクチャ/DDD/config_rules に準拠して再構築するためのExecPlan。名前は「storage」とし、アップロードを含むストレージ基盤を担う。

## Purpose / Big Picture

- 目的: 旧 upload-service の挙動を維持しつつ、新しい4レイヤー構造で storage サービスを実装する。
- 完了後: apps/base から共通のアップロード/ストレージ機能を利用できる。
- 動作確認イメージ: `go test ./...`（ユニット）、`go run ./cmd/api` → アップロードAPI/署名付きURLなどを確認（旧挙動に合わせる）。

## Progress

- [x] (2025-11-30 01:00) 既存コード・docs の調査完了
- [x] (2025-11-30 01:20) DDD観点での設計方針を固める（storageとして再構成）
- [x] (2025-11-30 02:00) domain 層の実装（content-type判定）
- [x] (2025-11-30 02:20) usecase 層の実装（Uploadフロー）
- [x] (2025-11-30 02:30) adapter 層の実装（HTTPハンドラ）
- [x] (2025-11-30 02:40) infra 層の実装（S3互換クライアント）
- [x] (2025-11-30 02:45) テスト & 動作確認（テーブル駆動ユニットテスト、go test ./...）
- [x] (2025-11-30 02:50) リファクタリング & 後片付け

## Surprises & Discoveries

- Observation: ...
  - Evidence: ...
  - Files: ...

## Decision Log

- Decision: ...
  - Rationale: ...
  - Date/Author: ...

## Outcomes & Retrospective

- Achieved:
- Remaining:
- Lessons:

## Context and Orientation

- 対象: base/storage backend（旧 upload-service を新構造へ）
- 参照 docs:
  - `docs/architecture.md`
  - `docs/development.md`
  - `docs/config_rules.md`
  - `docs/test_strategy.md`
  - `docs/ddd/index.md`, `docs/ddd/layers/*`, `docs/ddd/modeling/*`, `docs/ddd/rules/data-access.md`
- 先行 ExecPlan: `docs/DEVLOG/2025-11-29_base-refactor.md`(auth-line), `docs/DEVLOG/2025-11-29_base-auth-twitter.md`, `docs/DEVLOG/2025-11-29_base-message-refactor.md`
- 旧コード: `__before/base-services/upload-service/**`

## Plan of Work

- 旧 upload-service の挙動・API・env を調査。
- DDDマッピング策定：
  - domain: ファイル/オブジェクト/パス/メタ情報/サイズ制約等
  - usecase: アップロード/署名URL/削除/バリデーション
  - adapter: HTTPハンドラ（multipart or presigned URL 生成）
  - infra: ストレージクライアント（S3/R2/ローカル）、ファイルパス生成
  - cmd: DI/サーバ起動、configロード
- ディレクトリ/Goモジュール生成（base/storage/backend 配下）。
- Config/envテンプレの追加（STORAGE_* キー）。
- 実装順:
  1. Configローダー + envテンプレ
  2. domain (file object)
  3. usecase (upload/presign/delete)
  4. infra (storage client)
  5. adapter (HTTP)
  6. cmd (DI)
  7. テスト（domain/usecase中心）
- 最終確認: `go test ./...` + 手動アップロード確認メモ。

## Concrete Steps

- 作業ディレクトリ: `base/storage/backend`
- コマンド例:
  - `go test ./...`
  - `go run ./cmd/api`
  - `curl -X POST http://localhost:8080/upload ...`

## Validation and Acceptance

- `go test ./...` が通ること。
- 旧挙動（アップロード/URL生成など）が維持されていること。
- ストレージクライアント切替が環境変数で行えること。

## Idempotence and Recovery

- ステップは再実行可。破壊的コマンド禁止。
- 失敗時は差分を確認しながらやり直す。

## Artifacts and Notes

- 旧コード: `__before/base-services/upload-service/`
