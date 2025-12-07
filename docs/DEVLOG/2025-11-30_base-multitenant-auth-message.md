# base/auth & base/message マルチテナント化計画 (ExecPlan)

auth（LINE/Twitter）および message（line/discord）のマルチテナント対応を行うための実行計画。

## Purpose / Big Picture

- 目的: マルチテナント環境でも安全かつ柔軟に認証・メッセージ機能を提供できるようにする。
- ゴール: テナントごとに設定（origin/redirect/client credentials/subjects等）を切り替え可能にし、単一デプロイで複数テナントを捌ける状態。
- 範囲: base/auth（LINE/Twitter）と base/message（line/discord/webhook/worker/ingress）。storageは本計画のスコープ外。

## Progress

- [x] (2025-11-30 03:10) 現状調査（テナント変数・固定値の洗い出し）
- [x] (2025-11-30 03:20) 設計方針決定（Configローディング/テナント解決/ACL）
- [x] (2025-11-30 12:10) base/auth の改修（マルチテナント対応・WithTenantミドルウェア）
- [x] (2025-11-30 12:20) base/message の改修（ingress/webhook/worker のマルチテナント対応）
- [x] (2025-11-30 12:25) テスト & 動作確認（GOCACHE指定で go test ./... 実行）
- [x] (2025-11-30 12:35) auth: LINE/Twitter をテナントごとに片方だけでも動くように緩和（未設定のプロバイダは 404 で無効化しログ出力）
- [x] (2025-12-07 01:00) リファクタリング & 後片付け（configディレクトリ運用統一、暗号化運用整備）

## Surprises & Discoveries

- Observation: go test がホストの `$GOCACHE` に書き込めず失敗する環境がある。
  - Evidence: `operation not permitted`（macOSのLibrary配下が書込不可）
  - Files: なし（テストコマンドログ）
  - Action: `GOCACHE=/Users/sngm3741/Workspace/roots/.gocache` を指定して回避。

## Decision Log

- Decision: テナント解決は Host 先頭ラベルを用いる（例: tenantA.example.com -> tenantA）。
  - Rationale: シンプルで各サービス共通に流用でき、LBやIngressの設定で切り替えしやすい。
  - Date/Author: 2025-11-30 / Codex
- Decision: テナント固有情報は YAML に外だしし、env には HTTPポートとファイルパス程度のみ残す。
  - Rationale: マルチテナントで env が肥大化し事故リスクが高いため。`infra/configs/templates/base/auth/tenants/example.yaml` / `.../message/tenants/example.yaml` を唯一の参照源とする。
  - Date/Author: 2025-11-30 / Codex
- Decision: message の NATS 接続はテナント毎の URL で張り、URLが同一ならコネクションをプール共有する。
  - Rationale: テナント毎の隔離要件に対応しつつ接続数を抑える。
  - Date/Author: 2025-11-30 / Codex
- Decision: テナント/環境設定はディレクトリ配下のファイル群をソートマージしてロードする方式に統一（auth/messageとも）。
  - Rationale: tenants/<id>.yaml を追加するだけで拡張でき、差分管理が容易。
  - Date/Author: 2025-12-07 / Codex
- Decision: configファイルは sops+age で暗号化し、平文は gitignore。暗号化版のみコミット（Makeターゲットを用意）。
  - Rationale: 秘匿情報の漏洩を防ぎつつgit管理可能にするため。
  - Date/Author: 2025-12-07 / Codex

## Outcomes & Retrospective

- Achieved: base/auth・base/message ともに YAML 駆動のマルチテナント化完了、go test での最低限検証完了。
- Remaining: ログ/エラーメッセージの粒度見直し、Phase3 以降の着手準備。
- Lessons: テスト実行時のキャッシュパスに注意（CI含め明示する）。Host 解決はシンプルだがサブドメイン設計とセットで運用ルール化が必要。

## Context and Orientation

- 対象: base/auth（LINE/Twitter）、base/message（line/discord webhook/worker/ingress）
- 想定課題:
  - 現行は `ALLOWED_ORIGINS`/`DEFAULT_REDIRECT_ORIGIN` 等を固定値で持ち、マルチテナントでは運用困難。
  - message側は subjects/line channel token/discord webhook URL などを固定envで持っている。
  - ポートやエンドポイントは共通バイナリで混在、テナント別設定がない。

## Plan of Work

- 現状調査:
  - auth: origin周り（allowed/default）、client credentials、state/JWT secret の扱いを棚卸し。
  - message: subject、LINE token/Discord webhook URL、デフォルトdestination 等の固定値を棚卸し。
  - envテンプレを元に「テナントで変わるもの/変わらないもの」を分類。
- 設計方針:
  - 「テナント設定」を外部ソースからロードする形を決める（例: テナント定義ファイル/DB/動的フェッチ）。
  - リクエストからテナントを解決する方法を定義（例: Hostヘッダ/クエリ/ヘッダ）。
  - テナントごとにエンドポイント/キー/originを切り替えるコンテキストを用意。
- base/auth 改修:
  - テナント解決 → テナント設定（allowed origins, default redirect, client credentials, state/jwt secret）を選択。
  - env には共通デフォルト値のみを残し、テナント個別は外部設定から読み込む。
  - Handler/usecaseでテナント設定を必須化（origin未指定はエラー）。
- base/message 改修:
  - Ingress/Webhook/Workerでテナントごとに subject / token / webhook URL を切り替える仕組みを導入。
  - `MESSENGER_DEFAULT_DESTINATION` 等の固定値を廃止し、テナント設定に移動。
  - NATS subject や送信先credentialsもテナント設定から取得。
- テスト:
  - テナント解決ロジックのテーブル駆動テスト。
  - テナント設定のロード/キャッシュ/フォールバックのテスト。
  - 主要ユースケース（auth login/message send）がテナントごとに正しく動くかのユニット/統合テスト。

## Concrete Steps

- 作業ディレクトリ: `base/auth/backend`, `base/message/backend`
- コマンド例:
  - `go test ./...`
  - `go run ./cmd/api`（auth）
  - `go run ./cmd/webhook`, `cmd/ingress`, `cmd/worker`（message）

## Validation and Acceptance

- テナントごとに origin/redirect/client credentials が切り替わること。
- テナントごとに message subjects / tokens / webhook URL が切り替わること。
- デフォルト/固定envがなくても動く（設定が無いテナントはエラーで弾く）。

## Idempotence and Recovery

- 設定の再ロードができる設計にするか、起動時ロードのみかを決めておく。
- 破壊的コマンドは使わず、差分で進める。

## Artifacts and Notes

- 旧env例: `AUTH_*`, `MESSENGER_*`, `DISCORD_*`, `R2_*` 等
- テナント設定の外部化（ファイル/DB）案を検討する。
