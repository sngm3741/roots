# kusakari フロントデザイン同期（ref/front-design）

この ExecPlan は生きている文書です。作業が進むにつれて、`Progress`、`Surprises & Discoveries`、`Decision Log`、`Outcomes & Retrospective` を必ず更新すること。

Roots では ExecPlan ファイルを `docs/DEVLOG/` 配下に置き、
このドキュメントは `docs/architecture.md` および `docs/ddd/**` に従って維持する。

## Purpose / Big Picture

- このタスクの目的: kusakari フロントエンドを `apps/kusakari/ref/front-design` と同一のデザイン・ページ遷移・サイトマップに同期する。
- 完了するとユーザー/システム視点で何ができるようになるか: 参照デザインと同じページ構成・遷移が本番フロントで再現される。
- 動作確認のイメージ: `apps/kusakari/frontend` を起動して各ページに遷移し、表示と導線が一致することを確認。

## Progress

- [x] (2026-01-08 00:00) 現状実装と参照デザインの差分把握
- [x] (2026-01-08 00:00) ルーティング構成の設計（静的/動的ルート整理）
- [x] (2026-01-08 00:00) 共通レイアウト・ナビゲーションの再利用設計
- [x] (2026-01-08 00:00) 各ページコンポーネントの移植
- [x] (2026-01-08 00:00) ルート定義の反映
- [ ] (2026-01-08 00:00) 動作確認

## Surprises & Discoveries

- Observation: なし
  - Evidence: なし
  - Files: なし

## Decision Log

- Decision: 参照デザインのページ構成を React Router ルートに合わせ、共通レイアウトで Header/Footer を再利用する。
  - Rationale: 重複を減らし再利用性を高めるため。
  - Date/Author: 2026-01-08 / codex

## Outcomes & Retrospective

- Achieved:
- Remaining:
- Lessons:

## Context and Orientation

- 対象アプリ: `apps/kusakari/frontend`
- 関連ディレクトリ:
  - `apps/kusakari/frontend/app/routes/`
  - `apps/kusakari/frontend/app/components/`
  - `apps/kusakari/ref/front-design/src/`
- 関係する docs:
  - `docs/architecture.md`
  - `docs/development.md`

## Plan of Work

- 参照デザインのページ/コンポーネントを洗い出し、既存実装との差分を整理する。
- ルート構成を `app/routes.ts` に反映できる形で設計する。
- Header/Footer/Breadcrumb/PageHeader などを共通化し、ページはレイアウトコンポーネントで再利用する。
- 各ページを `app/routes/` に移植し、リンク/遷移は React Router の仕組みに置き換える。
- `app/routes.ts` を更新し、サイトマップ通りのルートを登録する。
- 主要ページの遷移と表示を確認する。

## Concrete Steps

- 作業ディレクトリ: `apps/kusakari/frontend`
- 参照デザイン読み込み: `apps/kusakari/ref/front-design/src/`
- ルート/コンポーネント更新

## Validation and Acceptance

- `/` と主要ページ（/services, /pricing, /works, /contact など）が遷移できる。
- 参照デザインと同一のレイアウト・コンテンツが表示される。
- ヘッダー/フッターのリンクがサイトマップに一致する。

## Idempotence and Recovery

- 変更はファイル編集のみ。差し戻しは `git diff` で確認のうえ手動で戻す。

## Artifacts and Notes

- 作成/更新する可能性があるファイル:
  - `apps/kusakari/frontend/app/routes.ts`
  - `apps/kusakari/frontend/app/routes/*.tsx`
  - `apps/kusakari/frontend/app/components/*.tsx`
