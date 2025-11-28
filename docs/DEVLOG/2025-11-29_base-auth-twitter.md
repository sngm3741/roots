# base/auth Twitter OAuth2 Migration (Phase 2)

この ExecPlan は旧 `__before/base-services/auth-service/auth-twitter` を  
Project Roots の新アーキテクチャ/DDD/config_rules に準拠させるための計画。  
Phase 1（auth-line）の成果を踏襲し、Twitter(X) OAuth2+PKCE を同等構造で実装する。

## Purpose / Big Picture

- 目的: 旧 auth-twitter の挙動を維持しつつ、新しい4レイヤー構造へ移植する。
- 完了後にできること: 共通 base/auth サービスとして Twitter ログインが提供され、apps から利用可能。
- 動作確認イメージ: `go test ./...`（ユニット）、`go run ./cmd/api` → `/twitter/login` → `/twitter/callback` でフラグメントに結果を返す。

## Progress

- [x] (2025-11-29 18:00) 既存コード・docs の調査完了
- [x] (2025-11-29 18:20) DDD観点での設計方針を固める（PKCE/Stateの責務整理）
- [x] (2025-11-29 19:00) domain 層の実装（TwitterユーザーID/表示名/ハンドル/アイコン）
- [x] (2025-11-29 20:00) usecase 層の実装（OAuth2+PKCEフロー、JWT発行）
- [x] (2025-11-29 20:30) adapter 層の実装（HTTP/CORS/リダイレクト）
- [x] (2025-11-29 21:00) infra 層の実装（Twitter APIクライアント、PKCEサポート）
- [x] (2025-11-29 21:10) テスト & 動作確認（ユニットテスト追加、go test ./...）
- [x] (2025-11-29 22:00) リファクタリング & 後片付け

## Surprises & Discoveries

- Observation: ...
  - Evidence: ...
  - Files: ...

## Decision Log

- Decision: LINE/Twitterを同一HTTPサーバーに統合し、middleware/healthzを共有する構成とする  
  - Rationale: base/authとして複数プロバイダを1プロセスで扱うほうが運用容易のため  
  - Date/Author: 2025-11-29 / taiichi
- Decision: stateはHMACベースのステートレス管理を継続し、PKCE code_verifierはメモリストアでstateと紐付けて一度きり取得  
  - Rationale: 旧実装踏襲で挙動を変えず、外部ストアを不要にするため  
  - Date/Author: 2025-11-29 / taiichi
- Decision: JWTのclaimは旧実装に合わせて sub/name/picture/preferred_username を発行し、audienceはenv指定時のみ付与  
  - Rationale: 後方互換を保ちつつオプションでaudienceを付けられるようにするため  
  - Date/Author: 2025-11-29 / taiichi

## Outcomes & Retrospective

- Achieved:
- Remaining:
- Lessons:

## Context and Orientation

- 対象: base/auth backend（Twitter OAuth2移植）
- 参照 docs:
  - `docs/architecture.md`
  - `docs/development.md`（ExecPlan/作業手順）
  - `docs/config_rules.md`
  - `docs/ddd/index.md`, `docs/ddd/layers/*`, `docs/ddd/modeling/*`, `docs/ddd/rules/data-access.md`
  - 先行 ExecPlan: `docs/DEVLOG/2025-11-29_base-refactor.md`（Phase1 auth-line）
- 旧コード: `__before/base-services/auth-service/auth-twitter/**`

## Plan of Work

- 旧 auth-twitter の構造・挙動を洗い出し（config/state/server/twitter.go）。
- DDDマッピング策定：
  - domain: Twitterユーザー集約（ID/username/displayName/avatar）
  - usecase: OAuth2+PKCE開始/コールバック、state検証、JWT発行
  - adapter: HTTP handler + CORS + リダイレクトフラグメント
  - infra: Twitter APIクライアント（authorize URL生成、token交換、profile取得）
  - cmd: DI/サーバ起動、configロード
- ディレクトリ/Goモジュール生成（Phase1と揃える）。
- Config/envテンプレの追加（AUTH_TWITTER_*）。
  - OAuth2 PKCE: code_verifier/code_challenge処理をどこに置くか決定（usecase or infra）。
- 実装順:
  1. Configローダー + envテンプレ
  2. domain (user)
  3. usecase (state/PKCE/JWT)
  4. infra (Twitter API)
  5. adapter (HTTP)
  6. cmd (DI)
  7. テスト（state/PKCE/usecase）
- 最終確認: `go test ./...` + 手動フロー確認メモ。

## Concrete Steps

- 作業ディレクトリ: `base/auth/backend`
- コマンド例:
  - `go test ./...`
  - `go run ./cmd/api`
  - `curl -X POST http://localhost:8080/twitter/login ...`

## Validation and Acceptance

- `go test ./...` が通ること。
- `/twitter/login` → Twitter authorize へ遷移でき、`/twitter/callback` でJWT付きフラグメントが返ること。
- JWT payload に sub/username/displayName/avatar が含まれること（旧挙動踏襲）。

## Idempotence and Recovery

- ステップは再実行可。コード生成/DIのみでDB変更なし。
- 失敗時は作業ブランチで差分確認しながらやり直す（破壊的コマンドは禁止）。

## Artifacts and Notes

- 旧コード: `__before/base-services/auth-service/auth-twitter/`
- 新コード想定: `base/auth/backend/internal/{domain,usecase/...,adapter/http,infra/external/twitter}`, `cmd/api`
