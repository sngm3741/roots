# makotoclub admin 解析ダッシュボード

この ExecPlan は生きている文書です。作業が進むにつれて、`Progress`、`Surprises & Discoveries`、`Decision Log`、`Outcomes & Retrospective` を必ず更新すること。

Roots では ExecPlan ファイルを `docs/DEVLOG/` 配下に置き、
このドキュメントは `docs/architecture.md` および `docs/ddd/**` に従って維持する。

## Purpose / Big Picture

- このタスクの目的: 管理画面でPV・流入・滞在時間を可視化し、分析を画面操作だけで行えるようにする
- 完了するとユーザー/システム視点で何ができるようになるか: 管理画面からサイト全体のアクセス状況とページ別傾向を確認できる
- 動作確認のイメージ（URL / コマンド etc）:
  - `GET /api/analytics?days=7&limit=20`
  - admin の `/analytics` 画面でサマリーとランキングを表示

## Progress

- [x] (2026-02-08 00:00) admin既存構成と既存APIの調査完了
- [x] (2026-02-08 00:00) backend: `/api/analytics` 集計APIの実装
- [x] (2026-02-08 00:00) frontend: 解析ダッシュボード画面の実装
- [x] (2026-02-08 00:00) frontend: ルーティングとナビゲーション追加
- [x] (2026-02-08 00:00) build検証
- [x] (2026-02-08 00:00) legacy合算撤去（v2正本へ統一）
- [x] (2026-02-08 00:00) first-touch補完を使った流入元集計へ更新

## Surprises & Discoveries

- Observation: admin には既に `access_logs` 用の画面/APIがあるため、解析画面追加の導線は再利用しやすい
  - Evidence: `src/routes/access-logs/AccessLogPage.tsx`, `functions/api/access-logs.ts`
  - Files: `apps/makotoclub/admin/src/routes/access-logs/AccessLogPage.tsx`, `apps/makotoclub/admin/functions/api/access-logs.ts`
- Observation: APIの `referrers` 廃止直後に旧フロントbundleが参照して本番クラッシュした
  - Evidence: `Cannot read properties of undefined (reading 'length')`
  - Files: `apps/makotoclub/admin/functions/api/analytics.ts`, `apps/makotoclub/admin/src/routes/analytics/AnalyticsPage.tsx`

## Decision Log

- Decision: 解析は新規 `/api/analytics` で集計して返し、フロントは単一画面で表示する
  - Rationale: 既存APIへの副作用を避け、保守時の責務分離を明確にする
  - Date/Author: 2026-02-08 / 太一・codex
- Decision: 累計PV/今日PVは legacy `page_view_counts` を合算して表示する
  - Rationale: v2導入前の表示履歴との断絶を避けるため
  - Date/Author: 2026-02-08 / 太一・codex
- Decision: 流入元は「外部流入（ランディング）」と「内部遷移」を分離して表示する
  - Rationale: 集客評価と導線評価の目的が異なるため、単一ランキングでは意思決定を誤る
  - Date/Author: 2026-02-08 / 太一・codex
- Decision: APIに `referrers` を互換フィールドとして残し、フロントは未定義安全にする
  - Rationale: デプロイの段差で旧bundleが残ってもクラッシュしないようにするため
  - Date/Author: 2026-02-08 / 太一・codex
- Decision: legacy `page_view_counts` 合算を撤去し、admin解析もv2正本に統一する
  - Rationale: 全体PVと流入元ランキングで母数不一致が発生し、判断を誤るため
  - Date/Author: 2026-02-08 / 太一・codex
- Decision: `analytics_access_hits.referrer_host` が空の行は `analytics_session_attribution` で補完して集計する
  - Rationale: SNS経由など Referer 欠損トラフィックが `(direct)` に偏る問題を緩和するため
  - Date/Author: 2026-02-08 / 太一・codex

## Outcomes & Retrospective

- Achieved:
  - admin functions に `GET /api/analytics` を追加し、サマリー/日次/ページ/流入/UTMを返却
  - admin 画面に `/analytics` を追加し、期間指定で解析を可視化
  - ナビゲーションに「解析」導線を追加
  - 後方互換（`referrers`）と未定義ガードを追加し、本番クラッシュを回避
  - admin解析の全体PV/日次PVを v2正本（`analytics_access_hits`）に統一
  - `npm run build` を通過
  - first-touch補完あり/なしを `coverage` で判別できるようにした
- Remaining:
  - 直近データの運用監視（集計値とトップ表示値の整合チェック）
  - 外部流入定義の見直し（必要なら `*.pages.dev` を内部扱いから除外）
- Lessons:
  - 解析導入期は旧カウンタとの合算ロジックを明示しないと数字の不連続が誤解を生む

## Context and Orientation

- 対象アプリ / サービス: `apps/makotoclub/admin`
- 関連する主要ディレクトリ:
  - `apps/makotoclub/admin/functions/api/`
  - `apps/makotoclub/admin/src/routes/`
  - `apps/makotoclub/admin/src/api/`
- 関係する docs:
  - `docs/architecture.md`
  - `docs/development.md`
  - `docs/test_strategy.md`

## Plan of Work

- `functions/api/analytics.ts` を追加し、D1からサマリー/日次/ページ別/流入元/UTMを返す
- `src/types.ts` と `src/api/client.ts` に解析レスポンス型とAPI呼び出しを追加する
- `src/routes/analytics/AnalyticsPage.tsx` を追加してダッシュボードUIを実装する
- `router.tsx` と `Layout.tsx` に導線を追加する
- `npm run build` で検証する

## Concrete Steps

- `edit apps/makotoclub/admin/functions/api/analytics.ts`
- `edit apps/makotoclub/admin/src/types.ts`
- `edit apps/makotoclub/admin/src/api/client.ts`
- `add apps/makotoclub/admin/src/routes/analytics/AnalyticsPage.tsx`
- `edit apps/makotoclub/admin/src/routes/router.tsx`
- `edit apps/makotoclub/admin/src/routes/Layout.tsx`
- `npm run build`

## Validation and Acceptance

- `npm run build` が成功する
- `/api/analytics?days=7&limit=20` がJSONを返す
- `/analytics` 画面でサマリーとランキングが表示される

## Idempotence and Recovery

- 追加ファイル中心なので差分単位でロールバック可能
- 既存API（`/api/access-logs`）は変更しないため影響範囲は限定される
