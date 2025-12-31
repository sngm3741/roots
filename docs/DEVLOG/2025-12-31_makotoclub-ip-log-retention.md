# IPログ保存（1年）対応

この ExecPlan は生きている文書です。作業が進むにつれて、`Progress`、`Surprises & Discoveries`、`Decision Log`、`Outcomes & Retrospective` を必ず更新すること。

Roots では ExecPlan ファイルを `docs/DEVLOG/` 配下に置き、  
このドキュメントは `docs/architecture.md` および `docs/ddd/**` に従って維持する。

## Purpose / Big Picture

- このタスクの目的: 開示請求・不正対応に備え、投稿系APIのIPログを1年間保存する仕組みを追加する。
- 完了するとユーザー/システム視点で何ができるようになるか: 投稿関連のアクセスがいつ・どこから・どのエンドポイントで起きたかを追跡できる。
- 動作確認のイメージ（URL / コマンド etc）:
  - `wrangler d1 execute ... --file <migration>` でテーブル追加
  - ローカル投稿で `access_logs` に記録されることを確認

## Progress

- [x] (2025-12-31 12:40) 既存コード・ログ経路の調査完了
- [x] (2025-12-31 12:40) ログ保存仕様（対象API/保存項目/保持期間）の確定
- [x] (2025-12-31 12:50) D1テーブル追加（migration）
- [x] (2025-12-31 12:50) 投稿系APIのログ書き込み実装
- [x] (2025-12-31 13:20) Adminでログ確認画面を追加
- [x] (2025-12-31 12:50) 1年超ログの削除手段を実装（手動SQL）
- [ ] (2025-12-31 00:00) プライバシーポリシー文面更新
- [ ] (2025-12-31 00:00) ローカル動作確認

## Surprises & Discoveries

- Observation: （作業中に記録）
  - Evidence: 
  - Files: 

## Decision Log

- Decision: 保存期間は 1 年（365 日）
  - Rationale: 開示請求対応と運用負荷のバランス
  - Date/Author: 2025-12-31 / 太一
- Decision: 保存項目は最小限（IP/User-Agent/パス/メソッド/ステータス/日時）
  - Rationale: 個人情報の取り扱いを最小化
  - Date/Author: 2025-12-31 / 太一
- Decision: 1年超ログの削除は手動コマンドで運用
  - Rationale: 初期は運用負荷を抑え、実装を単純化する
  - Date/Author: 2025-12-31 / 太一
- Decision: 削除は月1回の手動実行で運用
  - Rationale: 運用負荷を抑えつつ保持期間を守るため
  - Date/Author: 2025-12-31 / 太一

## Outcomes & Retrospective

- Achieved:
- Remaining:
- Lessons:

## Context and Orientation

- 対象アプリ / サービス: `apps/makotoclub/frontend`（Cloudflare Pages Functions）
- 関連する主要ディレクトリ:
  - `apps/makotoclub/frontend/functions/`（API実装）
  - `apps/makotoclub/frontend/functions/db/`（migration配置候補）
  - `apps/makotoclub/frontend/app/routes/`（UIの表記更新箇所）
- 関係する docs:
  - `docs/architecture.md`
  - `docs/development.md`
  - `docs/config_rules.md`

## Plan of Work

1. 既存の投稿系API（`/api/surveys`、`/api/draft-surveys`、画像アップロード等）を特定。
2. `access_logs` テーブルをD1に追加するmigrationを作成。
3. 投稿系APIのハンドラでログをD1へ書き込み。
4. 1年超ログの削除方法を手動コマンドで実装し、月1回の運用手順を整理。
5. プライバシーポリシーに「IPログを1年間保存」の明記。
6. ローカルで投稿→ログ記録→削除コマンドまで確認。

## Concrete Steps

- 作業ディレクトリ:
  - `roots/`
- 予定コマンド:
  - `rg -n "POST /api" apps/makotoclub/frontend/functions`
  - `wrangler d1 execute makotoclub --local --file functions/db/access_logs_migration.sql`
  - `wrangler d1 execute makotoclub --remote --file functions/db/access_logs_cleanup.sql`

## Risks / Mitigations

- リスク: ログの保存範囲が過剰で個人情報リスクが上がる  
  - 対策: 最小限の項目に絞る／必要性を明記する
- リスク: 保存期間の運用ミス（削除されない）  
  - 対策: 定期削除の導入 or 手動運用手順を明文化
- リスク: パフォーマンス低下  
  - 対策: 非同期化や失敗時の影響を最小化する
