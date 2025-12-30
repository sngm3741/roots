# MakotoClub 検索仕様変更（スペック/年齢＋店舗/アンケート切替）

この ExecPlan は生きている文書です。作業が進むにつれて、`Progress`、`Surprises & Discoveries`、`Decision Log`、`Outcomes & Retrospective` を必ず更新すること。

Roots では ExecPlan ファイルを `docs/DEVLOG/` 配下に置き、  
このドキュメントは `docs/architecture.md` および `docs/ddd/**` に従って維持する。

## Purpose / Big Picture

- このタスクの目的: トップの検索カードを新仕様に合わせて動作変更し、店舗/アンケートの検索精度を上げる。
- 完了するとユーザー/システム視点で何ができるようになるか: スペック/年齢を基準にした検索ができ、検索対象を店舗/アンケートで切り替えられる。
- 動作確認のイメージ（URL / コマンド etc）:
  - `/` の検索カードで条件入力→検索結果が `/surveys` または `/stores` に反映される
  - `npx wrangler d1 execute makotoclub --remote --command "...集計SQL..."` で初期集計

## Progress

- [x] (2025-12-25 04:10) 既存コード・docs の調査完了
- [x] (2025-12-25 04:10) 仕様整理と検索条件の確定
- [x] (2025-12-25 04:30) DB スキーマ更新（store_stats 追加）
- [x] (2025-12-25 04:30) API 検索条件の実装（/api/surveys, /api/stores）
- [x] (2025-12-25 04:30) 集計更新ロジックの追加（アンケート追加/更新/削除）
- [x] (2025-12-25 04:30) フロント検索フォームとクエリ連携の実装
- [x] (2025-12-25 04:45) 初期集計 SQL の用意
- [x] (2025-12-25 05:10) トップページに検索結果の一覧・ソート・ページングを統合
- [ ] (2025-12-25 00:00) 動作確認

## Surprises & Discoveries

- Observation: 既存の検索 API は `apps/makotoclub/frontend/functions/[[path]].ts` で実装されている。
  - Evidence: `/api/surveys`, `/api/stores` が同一ハンドラにまとまっている。
  - Files: `apps/makotoclub/frontend/functions/[[path]].ts`

## Decision Log

- Decision: 店舗の集計値は `store_stats` テーブルで保持し、アンケート追加/更新/削除時に即時更新する。
  - Rationale: 検索条件に最小/最大/中央値を使うため、クエリごとの集計は重い。
  - Date/Author: 2025-12-25 / taiichi
- Decision: 初期集計は `wrangler d1 execute` で一度だけ実行する。
  - Rationale: API 追加より運用コストが低い。
  - Date/Author: 2025-12-25 / taiichi

## Outcomes & Retrospective

- Achieved:
- Remaining:
- Lessons:

## Context and Orientation

- 対象アプリ / サービス: apps/makotoclub/frontend
- 関連する主要ディレクトリ:
  - `apps/makotoclub/frontend/functions/[[path]].ts`
  - `apps/makotoclub/frontend/functions/db/schema.sql`
  - `apps/makotoclub/frontend/app/routes/_index.tsx`
  - `apps/makotoclub/frontend/app/routes/surveys.tsx`
  - `apps/makotoclub/frontend/app/routes/stores.tsx`
  - `apps/makotoclub/frontend/app/lib/surveys.server.ts`
  - `apps/makotoclub/frontend/app/lib/stores.server.ts`
- 関係する docs:
  - `docs/architecture.md`（全体構造）
  - `docs/development.md`（ExecPlan 運用）

## Plan of Work

- DB: `store_stats` を追加し、店舗の集計値（最小/最大/中央値/平均/件数）を保持する。
- API: `/api/surveys` と `/api/stores` に spec/age 条件を追加し、検索条件がある場合は満足度順の初期ソートにする。
- 集計更新: アンケート追加/更新/削除時に該当店舗の集計を再計算して `store_stats` を更新する。
- フロント: `/` の検索カードで検索対象トグルに応じて遷移先を切替し、`/surveys` と `/stores` で spec/age 条件を反映する。
- 初期集計: `wrangler d1 execute` で `store_stats` をバックフィルする SQL を用意する。

## Concrete Steps

- `rg -n "api/surveys" apps/makotoclub/frontend/functions/[[path]].ts`
- `rg -n "api/stores" apps/makotoclub/frontend/functions/[[path]].ts`
- `sed -n '1,200p' apps/makotoclub/frontend/functions/db/schema.sql`
- `npx wrangler d1 execute makotoclub --remote --command "<集計SQL>"`
