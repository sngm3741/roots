# MakotoClub フロントUI Figma反映（shadcn/React Router 実装）

この ExecPlan は生きている文書です。作業が進むにつれて、`Progress`、`Surprises & Discoveries`、`Decision Log`、`Outcomes & Retrospective` を必ず更新すること。

Roots では ExecPlan ファイルを `docs/DEVLOG/` 配下に置き、このドキュメントは `docs/architecture.md` および `docs/ddd/**` に従って維持する。

## Purpose / Big Picture

- 目的: `apps/makotoclub/docs/figma_makoto_club_ui` に含まれる Figma ベースの UI を、現行フロント (`apps/makotoclub/frontend`) へ寸分違わず再実装する。
- 完了後: トップ/店舗一覧/店舗詳細/アンケート一覧・詳細・投稿/管理画面/静的ページが Figma デザインと同一のレイアウト・スタイルで表示される。ロジック・API コールは既存 worker 実装を維持。
- 動作確認イメージ: Cloudflare Pages dev（`npm run preview`）または通常 dev（`npm run dev`）で各ルートを開き、Figma のセクション/余白/配色/コンポーネントが一致していることをブラウザで確認。

## Progress

- [x] (準備) グローバルdocs確認（architecture/development/config_rules/ddd/**）
- [x] (準備) makotoclub docs 確認（frontend_common, api_contracts, frontend_cloudflare）
- [x] (準備) Figmaコードバンドル確認（`docs/figma_makoto_club_ui` 構成・主要ページ/コンポーネント把握）
- [ ] 現行フロントのコンポーネント/ルート構造の精査と差分洗い出し
- [ ] デザイン適用方針の確定（コンポーネント再利用/置換ポリシー）
- [ ] トップ/共通レイアウトの実装
- [ ] 一覧・詳細・投稿・管理 UI の実装
- [ ] スタイル・レスポンシブ調整（Figma差分潰し）
- [ ] 動作確認（dev/preview）とスクショ確認
- [ ] 後片付け（lint/型チェック、不要資産の整理）

## Surprises & Discoveries

- Observation: (未記入)
  - Evidence:
  - Files:

## Decision Log

- Decision: アイコンは `apps/makotoclub/frontend/public/icon.jpg` を採用し、他アセットは当面ダミーで進める
  - Rationale: Figma 指定に従い、最小限の実ファイルで早期にUI実装を完了させるため
  - Date/Author: 2025-12-09 / taiichi
- Decision: 静的ページ（利用規約/プライバシー/お問い合わせ）は Figma デザインに沿って実装対象に含める
  - Rationale: ページ群を寸分違わず再現するため
  - Date/Author: 2025-12-09 / taiichi

## Outcomes & Retrospective

- Achieved:
- Remaining:
- Lessons:

## Context and Orientation

- 対象: `apps/makotoclub/frontend`（React Router v7 + shadcn/ui + Tailwind）
- デザインソース: `apps/makotoclub/docs/figma_makoto_club_ui`（Vite + Tailwind4 + lucide）
- 既存仕様: `apps/makotoclub/docs/frontend_common.md`, `apps/makotoclub/docs/api_contracts.md`, Cloudflare デプロイ手順 `apps/makotoclub/docs/frontend_cloudflare.md`
- 現行ルート: `_index.tsx`, `stores.tsx`, `stores.$id.tsx`, `surveys.tsx`, `surveys.$id.tsx`, `surveys.new.tsx`, `admin.stores.tsx`, 静的ページ（未実装の場合は追加要否検討）

## Plan of Work

- Figmaバンドルの UI/コンポーネントを分解し、現行フロントのルートごとに対応付けを作成する。
- 共通レイアウト（ヘッダー/フッター、背景、コンテナ、タイポ/カラー）を既存 shadcn スタックに合わせて再構築し、各ルートで共有する。
- 各ページ（トップ/一覧/詳細/投稿/管理/静的）のセクション構造・カード・フォームを Figma と同じマージン・フォント・カラー・余白で移植する。
- 既存ロジック（loader/action, fetch API）は維持し、UI レイヤーのみ差し替え。型/データ契約 `api_contracts.md` を壊さない。
- Tailwind/Tokens は Figma 側の色/影/グラデを再現するため必要に応じてカスタムクラスや CSS 変数を追加するが、過剰なグローバル変更は避ける。
- dev/preview で実際の画面と Figma を見比べ、レスポンシブ含め寸分違わないか確認し微調整する。

## Concrete Steps

- 作業ディレクトリ: `apps/makotoclub/frontend`
- 調査/準備:
  - 既存 UI コンポーネント（header/footer/cards/form 等）の props/スタイル確認
  - Figma バンドルの主要スタイル（色/余白/影/角丸/フォントサイズ）をリストアップ
  - ルートごとの差分メモ作成
- 実装（順次更新予定）:
  - 共通レイアウトの差し替え
  - 各ページの UI 再実装
  - スタイル・レスポンシブ調整
- 検証:
  - `npm run dev` または `npm run preview` で各ページを実機確認
  - 可能ならスクリーンショット比較

## Validation and Acceptance

- `npm run lint` / `npm run typecheck`（存在する場合）でエラーがない。
- 全ルートでレイアウト崩れなし。Figma バンドルの余白/色/フォントサイズ/影/角丸/アニメーションに一致。
- 既存 loader/action の挙動は変更しない（API 契約は維持）。
- モバイル/PC 両方で Figma と同じ見え方になる（ブレークポイントの確認）。

## Idempotence and Recovery

- UIレイヤーのみ変更予定。ロジックは触らないため revert は差分戻しで対応可能。
- スタイル調整の反復を想定。大きな CSS 追加は局所ファイルに閉じ込める。

## Artifacts and Notes

- デザイン参照: `apps/makotoclub/docs/figma_makoto_club_ui/index.html`（Vite dev で閲覧可）
- 旧UI比較: `apps/makotoclub/frontend/app/routes/*` と `app/components/*`
