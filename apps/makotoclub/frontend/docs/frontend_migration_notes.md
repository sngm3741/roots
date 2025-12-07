# MakotoClub フロント移植メモ（Next.js → React Router）

## 現状まとめ（__before/makoto-club/frontend）

- 技術: Next.js 16 (App Router), React 19, Tailwind v4, server actions無し・データ取得は fetch で API を叩く。
- 環境変数: `API_BASE_URL`（または `NEXT_PUBLIC_API_BASE_URL`）。デフォルト `http://localhost:8080`。
- 主なルート（`src/app`）:  
  - `/` トップ（新着アンケート/店舗表示、サーチ）  
  - `/stores` 一覧（フィルタ・ページネーション）  
  - `/stores/[id]` 詳細（アンケート集計付き）  
  - `/surveys` 一覧  
  - `/surveys/[id]` 詳細  
  - `/surveys/new` 投稿フォーム  
  - `/admin/*` 管理: stores/surveys CRUD、検索、編集/新規/詳細  
  - `/contact`, `/terms`, `/privacy`, 404 ページなど静的コンテンツ
- API 依存（全て `API_BASE_URL` 直叩き）:  
  - Public: `/api/stores`（クエリ付き検索）、`/api/stores/:id`、`/api/stores/:id/surveys`  
  - Public: `/api/surveys`（sort/newest 等）、`/api/surveys/:id`、POST `/api/surveys`  
  - Admin: `/api/admin/stores` CRUD、`/api/admin/surveys` CRUD  
  - レスポンス shape: `StoreSummary/Detail`, `SurveySummary/Detail` 相当（`src/types` 参照）

## 移植時の方針（ドラフト）

- ルーティング: React Router のファイルベースに対応させ、`loader`/`action` で SSR データ取得。API呼び出しは Cloudflare Functions 経由に寄せるか、直接バックエンドエンドポイントを叩く場合でも base URL は config で一元化。
- 環境変数: config_rules に従い、Pages 環境は `context.cloudflare.env` から取得。フロント側は `app/config`（loader経由）で渡す。`API_BASE_URL` を frontend .env/dist テンプレに明示する。
- デザイン/コンポーネント: 旧 UI の主要コンポーネントを再利用し、`features/*` / `components/*` を `app/routes` から import する構成に寄せる。
- データアクセス: 旧 fetch ロジック (`src/lib/stores.ts`, `src/lib/surveys.ts` など) を loader/action から呼べる形に再ラップし、API base/エラーハンドリングを集約。
- UI/スタイル: Tailwind v4 + shadcn/ui を採用してコンポーネントを共通化する。Next Image 依存箇所は通常の `<img>` または shadcn/ui +適切なスタイルで置き換える。

## 要検討・未決

- 管理画面の認証/認可方式（旧実装では特に認証ロジックなしに見えるため、移植時に要方針決定）。
- 画像/アセット取り扱い（Next Image を使っている箇所の置き換え）。
- SEO/メタ情報の維持（必要な meta を loader 側で返すか、静的定義するか）。
