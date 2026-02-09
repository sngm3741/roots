# MakotoClub Frontend リファクタリング（一覧導線・静的ページ共通化）

この ExecPlan は生きている文書です。作業が進むにつれて、`Progress`、`Surprises & Discoveries`、`Decision Log`、`Outcomes & Retrospective` を必ず更新すること。

Roots では ExecPlan ファイルを `docs/DEVLOG/` 配下に置き、  
このドキュメントは `docs/architecture.md` および `docs/ddd/**` に従って維持する。

## Purpose / Big Picture

- このタスクの目的: `apps/makotoclub/frontend` の重複実装を減らし、導線とエラーメッセージの一貫性を上げる。
- 完了するとユーザー/システム視点で何ができるようになるか:
  - 一覧/詳細/静的ページの内部遷移が `Link` ベースで統一される
  - 失敗時のメッセージが日本語で揃う
  - 静的ページのレイアウト変更を共通コンポーネントで一括適用できる
- 動作確認のイメージ:
  - `/stores`, `/surveys`, `/stores/:id`, `/surveys/:id`, `/rag` の内部リンク遷移
  - `/faq`, `/company`, `/contact`, `/guideline`, `/privacy`, `/terms`, `/tokushoho` の表示崩れがないこと

## Progress

- [x] (2026-02-08 00:00) 既存差分・対象ファイルの調査
- [x] (2026-02-08 00:00) docs/architecture, development, test_strategy, ddd, config_rules の確認
- [x] (2026-02-08 00:00) 内部リンクの `Link` 統一
- [x] (2026-02-08 00:00) エラーメッセージ日本語統一
- [x] (2026-02-08 00:00) 静的ページ共通レイアウトの導入
- [x] (2026-02-08 00:00) 重複定数の共通化（一覧ソート）
- [x] (2026-02-08 00:00) typecheck 実行
- [x] (2026-02-08 00:00) build 実行

## Surprises & Discoveries

- Observation: ルートごとに内部遷移が `a href` と `Link` で混在している。
  - Evidence: `routes/stores.tsx`, `routes/surveys.tsx`, `components/layout/header.tsx`, `components/layout/footer.tsx`
  - Files:
    - `apps/makotoclub/frontend/app/routes/stores.tsx`
    - `apps/makotoclub/frontend/app/routes/surveys.tsx`
    - `apps/makotoclub/frontend/app/components/layout/header.tsx`
    - `apps/makotoclub/frontend/app/components/layout/footer.tsx`

## Decision Log

- Decision: 外部URLのみ `<a>` を残し、アプリ内遷移は `Link` に統一する。
  - Rationale: 画面遷移体験とコード規約を揃えるため。
  - Date/Author: 2026-02-08 / codex
- Decision: 静的ページの共通見出しとカード枠をコンポーネント化する。
  - Rationale: 文言修正や見た目調整の際の変更点を最小化するため。
  - Date/Author: 2026-02-08 / codex
- Decision: 一覧ソート定数は `app/lib/sort-options.ts` に集約し、各画面で import する。
  - Rationale: 並び替え項目の追加・表記変更時の修正漏れを防ぐため。
  - Date/Author: 2026-02-08 / codex

## Outcomes & Retrospective

- Achieved:
  - 一覧・詳細・ヘッダー/フッター・カード・画像モーダルの内部遷移を `Link` に統一した。
  - 英語の失敗ログ/エラー文言を日本語へ統一した。
  - 静的ページ7本に `StaticPageLayout`/`StaticPageSection` を適用し、共通構造へ寄せた。
  - ソート定数を `sort-options.ts` に集約した。
  - `npm run typecheck` と `npm run build` が成功した。
- Remaining:
  - なし（今回スコープ内）
- Lessons:
  - 内部リンクの混在は `rg` で定期的に機械検出し、段階的に潰すのが安全。

## Context and Orientation

- 対象アプリ / サービス: `apps/makotoclub/frontend`
- 関連する主要ディレクトリ:
  - `apps/makotoclub/frontend/app/routes`
  - `apps/makotoclub/frontend/app/components/layout`
  - `apps/makotoclub/frontend/app/lib`
- 関係する docs:
  - `docs/architecture.md`
  - `docs/development.md`
  - `docs/test_strategy.md`

## Plan of Work

- 一覧・詳細・ヘッダー/フッターの内部リンクを `Link` に置換する。
- 英語のログ/エラーメッセージを日本語に統一する。
- 静的ページ用の共通レイアウトコンポーネントを追加し、各静的ルートへ適用する。
- 一覧系ソート定数を共通化して重複を削減する。
- typecheck で差分の健全性を確認する。

## Concrete Steps

- `rg -n "href=\"/|Failed|failed" apps/makotoclub/frontend/app`
- `sed -n '1,220p' apps/makotoclub/frontend/app/routes/*.tsx`
- `npm run typecheck`（`apps/makotoclub/frontend`）

## Validation and Acceptance

- 受け入れ条件:
  - 内部リンクが `Link` に置換され、画面遷移が維持される
  - エラーメッセージの英語文言が残っていない
  - 静的ページで共通レイアウトが適用される
  - `typecheck` が成功する

## Idempotence and Recovery

- すべての変更は再実行可能なテキスト編集で、再適用しても同じ結果になる。
- 失敗時は対象ファイルの差分を個別に戻して再実行できる。
