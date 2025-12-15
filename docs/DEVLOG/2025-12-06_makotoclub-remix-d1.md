# MakotoClub フロントReact Router移植 & Backend Mongo→D1 移行調査・計画

この ExecPlan は生きている文書です。作業が進むにつれて、`Progress`、`Surprises & Discoveries`、`Decision Log`、`Outcomes & Retrospective` を必ず更新すること。

Roots では ExecPlan ファイルを `docs/DEVLOG/` 配下に置き、このドキュメントは `docs/architecture.md` および `docs/ddd/**` に従って維持する。

## Purpose / Big Picture

- 目的: `__before/makoto-club` の Next.js フロントと MongoDB バックエンドを、現行構造 (`apps/makotoclub`) の React Router (Remix系) + Cloudflare Pages/Functions + D1 へ再設計・移植するための調査と計画をまとめる。
- 完了後: フロントは React Router ベースで SSR/Loader を用い、バックエンドは DDD ルールに沿ったレイヤリングで D1 をデータストアとして利用する方針を固める。移行パスとスコープを明確化する。
- 動作確認のイメージ: 新フロントで主要ページ(トップ/店舗一覧/店舗詳細/アンケート投稿など)が SSR で動き、API が D1 を背後に持つ形で動作する。

## Progress

- [x] (2025-12-06) `__before/makoto-club/frontend` の画面/データ依存調査完了
- [x] (2025-12-06) `__before/makoto-club/backend` の Mongo スキーマ・API 調査完了
- [x] (2025-12-06) フロント移植方針/ルートマッピング草案
- [x] (2025-12-06) D1 スキーマ案・データ移行方針
- [x] (2025-12-06) 実装ステップ分割・リスク洗い出し
- [x] (2025-12-06) Cloudflare Functions + D1 初期API実装（stores/surveys GET/POST）、スキーマ追加、バインディング設定
- [x] (2025-12-07) API契約に合わせたフィルタ/集計/ソート拡張、トップ/店舗一覧の検索UI整備、wrangler生成物の除外設定
- [x] (2025-12-07) 店舗詳細設計/実装更新（最新10件・空状態CTA）、アンケート一覧/投稿の設計md追加、一覧UIに並び替え/ページネーション追加
- [ ] (2025-12-??) アンケート投稿をDraft保管に切り替え（survey_drafts追加、/api/surveys POSTの保存先変更）

## Surprises & Discoveries

- Observation: (未記入)
  - Evidence: 
  - Files: 

## Decision Log

- Decision: 旧APIのレスポンスshapeは互換維持を優先し、段階的に型再設計する（v1互換 → v2で整理）
  - Rationale: フロント移植を速め、リスクを分離するため
  - Date/Author: 2025-12-06 / taiichi
- Decision: 管理画面のUIは shadcn/ui コンポーネントをベースに再構築する
  - Rationale: Tailwind4環境でのUI共通化・開発速度のため
  - Date/Author: 2025-12-06 / taiichi
- Decision: D1 スキーマは stores/surveys を正規化し、集計値(averageRating/averageEarning等)はビューまたはアプリ側計算で提供。初期はトリガなしで計算ロジックをユースケース層に置く
  - Rationale: SQLite互換のD1でシンプルに始め、後から最適化を検討するため
  - Date/Author: 2025-12-06 / taiichi
- Decision: 公開用の stores/surveys には書き込まず、投稿は survey_drafts に一時保管する（/api/surveys POSTはDraft行を追加するだけ、store生成は行わない）
  - Rationale: 管理者の手動承認フローを優先し、公開データを汚染しないため
  - Date/Author: 2025-12-?? / taiichi

## Outcomes & Retrospective

- Achieved:
- Remaining:
- Lessons:

## Context and Orientation

- 対象アプリ: MakotoClub フロント/バックエンド
- 旧構造: `__before/makoto-club/frontend` (Next.js 16, Tailwind4, server actions) / `__before/makoto-club/backend` (Go, MongoDB)
- 新構造: `apps/makotoclub/frontend` (React Router 7 + Cloudflare Pages/Functions) / `apps/makotoclub/backend`（未実装 or 現行を要確認）
- 関連 docs: `docs/architecture.md`, `docs/development.md`, `docs/config_rules.md`, `docs/ddd/**`, `apps/makotoclub/docs/*`

## Plan of Work

- ドキュメント確認 (`docs/architecture.md`, `docs/development.md`, `docs/config_rules.md`, `docs/ddd/**`)
- 旧フロントのルート・データ依存・API呼び出し点の洗い出し（完了）
- 旧バックエンドの Mongo スキーマ・リポジトリ・API エンドポイントの抽出（完了）
- D1 向けスキーマ案作成（リレーショナル設計・インデックス・制約）
- フロントのルートマッピング案（React Router ファイル構成、loader/action設計、API呼び出しの切替）
- 移行ステップと優先順位策定（データ移行手順、段階的リリース可否）

### Front Route Mapping (draft)
- `/` → `routes/_index.tsx` loader: surveys(newest, limit3) + stores(latest3)
- `/stores` → `routes/stores.tsx` loader: list with filters/pagination
- `/stores/:id` → `routes/stores.$id.tsx` loader: detail + surveys
- `/surveys` → `routes/surveys.tsx` loader: list (sort/pagination)
- `/surveys/:id` → `routes/surveys.$id.tsx` loader: detail
- `/surveys/new` → `routes/surveys.new.tsx` action: post survey
- `/admin/stores` `/admin/stores/:id` `/admin/surveys` `/admin/surveys/:id` → shadcn/ui でCRUD画面、loader/action経由でAPI呼び出し
- 静的: `/contact`, `/terms`, `/privacy`, `404`

### D1 スキーマ案（ドラフト）
- tables:
  - `stores(id TEXT PK, name, branch_name, prefecture, area, industry, genre, unit_price, business_hours_open, business_hours_close, average_rating REAL, created_at, updated_at, deleted_at)`
  - `surveys(id TEXT PK, store_id TEXT FK->stores, visited_period TEXT, work_type TEXT, age INTEGER, spec_score REAL, wait_time_hours REAL, average_earning REAL, rating REAL, customer_comment TEXT, staff_comment TEXT, work_env_comment TEXT, etc_comment TEXT, cast_back TEXT, email_address TEXT, image_urls TEXT, created_at, updated_at, deleted_at)`
  - インデックス: `surveys(store_id)`, `stores(prefecture, industry, genre, name)`
- 集計: averageRating/earning等はユースケースで算出（初期はトリガなし）

### 実装ステップ（ドラフト）
- Phase1: フロント移植 (React Router) — 旧API(Mongo)を叩き、UIは shadcn/ui 化を開始
- Phase2: バックエンド D1 化 — スキーマ実装・API互換レイヤを Cloudflare Functions (D1) で実装
- Phase3: データ移行 — Mongo→D1 の移行スクリプトと動作確認
- Phase4: 切替 — フロントの API_BASE を D1 バックエンドに向ける、admin認証を導入/確認

## 実装状況（D1/Functions）
- `functions/db/schema.sql` で stores/surveys テーブル定義を追加
- `functions/[[path]].ts` で API ルーティングを追加（/api/* を先に処理）
  - GET `/api/stores` / `/api/stores/:id` / `/api/stores/:id/surveys`
  - GET `/api/surveys` / `/api/surveys/:id` / POST `/api/surveys`
- `wrangler.toml` に D1 バインディング（binding: DB）を追加（database_id は要設定）
- ローカルプレビュー時は `wrangler pages dev ... --d1 DB=makotoclub` で接続、テストデータは `npx wrangler d1 execute makotoclub --local --command "<INSERT...>"` で投入

## Concrete Steps

- 作業ディレクトリ: `roots/`
- 調査:
  - `find __before/makoto-club/frontend/src/app -maxdepth 2 -type f`
  - `rg \"fetch\" __before/makoto-club/frontend/src`
  - `find __before/makoto-club/backend/api/internal -maxdepth 3 -type f`
  - `rg \"mongo\" __before/makoto-club/backend/api`
- 以降の実装ステップは調査後に具体化する。

### 次のタスク（残）
- フロント: admin 認証方針、admin CRUD UI の削除/更新実装、フォームの入力候補・バリデーション強化、画像アップロード対応
- バックエンド: admin API 認証/認可、削除API、集計値の再計算ロジック（averageRating/earning等）、リモートD1へのマイグレーション実行手順
- データ移行: Mongo→D1 の移行スクリプト、動作確認手順
