# makotoclub アクセス解析 v2（全アクセス + 滞在時間）

この ExecPlan は生きている文書です。作業が進むにつれて、`Progress`、`Surprises & Discoveries`、`Decision Log`、`Outcomes & Retrospective` を必ず更新すること。

Roots では ExecPlan ファイルを `docs/DEVLOG/` 配下に置き、
このドキュメントは `docs/architecture.md` および `docs/ddd/**` に従って維持する。

## Purpose / Big Picture

- このタスクの目的: 全ページアクセスを正本として計測し、滞在時間と流入情報を取得できる解析基盤に更新する
- 完了するとユーザー/システム視点で何ができるようになるか: トップに全体PVを表示でき、将来の分析（滞在時間/流入）へ拡張可能になる
- 動作確認のイメージ（URL / コマンド etc）:
  - `GET /api/metrics/v2/summary?scope=site`
  - `POST /api/metrics/v2/events`
  - トップページ表示で全体PV（累計/今日）が更新される

## Progress

- [x] (2026-02-08 00:00) 既存のPV計測実装と影響範囲の調査完了
- [x] (2026-02-08 00:00) 方針確定（all_access正本、Cookie利用明示、heartbeat 30秒、トップ先行）
- [x] (2026-02-08 00:00) backend: metrics v2 API（summary/events）実装
- [x] (2026-02-08 00:00) backend: onRequestで全ページアクセス自動記録
- [x] (2026-02-08 00:00) frontend: ルート共通トラッカー実装
- [x] (2026-02-08 00:00) frontend: トップ表示のv2 summary切替
- [x] (2026-02-08 00:00) DB migration/cleanup（1ヶ月保持）追加
- [x] (2026-02-08 00:00) プライバシーポリシー更新
- [x] (2026-02-08 00:00) typecheck/build確認
- [x] (2026-02-08 00:00) legacy `page_view_counts` 合算を撤去し、v2正本へ一本化
- [x] (2026-02-08 00:00) session first-touch補完（direct削減）を追加

## Surprises & Discoveries

- Observation: 現状PVはトップ(`/`)固定のPOST/GETのみで、全ページアクセスが取れていない
  - Evidence: `app/routes/_index.tsx` の `/api/metrics/pv` 呼び出しが `path: "/"` 固定
  - Files: `apps/makotoclub/frontend/app/routes/_index.tsx`
- Observation: 既存の `page_view_counts` を即時破棄すると、トップPVがデプロイ時に不連続になる
  - Evidence: 新規 `analytics_access_hits` は導入時点で空テーブルのため、切替直後の累計が過小表示になる
  - Files: `apps/makotoclub/frontend/functions/_api/metrics.ts`

## Decision Log

- Decision: PVの正本は「サーバー側all_access（HTMLレスポンス）」とする
  - Rationale: JS無効や送信失敗でも計測でき、母数の安定性が高い
  - Date/Author: 2026-02-08 / 太一・codex
- Decision: 滞在時間はクライアントイベント（start/heartbeat/end）で推定する
  - Rationale: サーバーだけでは滞在時間を測れないため
  - Date/Author: 2026-02-08 / 太一・codex
- Decision: 解析データ保持は1ヶ月（30日）
  - Rationale: 必要十分な分析期間を確保しつつ、個人情報リスクとコストを抑える
  - Date/Author: 2026-02-08 / 太一・codex
- Decision: heartbeatは30秒間隔
  - Rationale: 精度と書き込みコストのバランスが最も良いため
  - Date/Author: 2026-02-08 / 太一・codex
- Decision: v2 summaryは移行期間のみ legacy `page_view_counts` を合算する
  - Rationale: デプロイ直後のPVカウント断絶を避けるため
  - Date/Author: 2026-02-08 / 太一・codex
- Decision: v2 summaryから legacy合算を撤去し、`analytics_access_hits` のみを正本とする
  - Rationale: 全体PVと流入分析の母数を一致させ、分析の一貫性を担保するため
  - Date/Author: 2026-02-08 / 太一・codex
- Decision: `analytics_session_attribution` を追加し、`referrer_host` 欠損時は first-touch を補完可能にする
  - Rationale: SNSアプリ等で Referer が欠落するケースでも、同一セッション内で取得できた初回流入を集計に反映するため
  - Date/Author: 2026-02-08 / 太一・codex

## Outcomes & Retrospective

- Achieved:
  - `analytics_access_hits` / `analytics_page_views` を正本とする v2 API を実装
  - SSRレスポンス時の全HTMLアクセスをサーバー側で自動記録するように変更
  - ルート共通のトラッカーで `start/heartbeat/end` を送信し、滞在時間推定を記録
  - トップのPV表示を `GET /api/metrics/v2/summary?scope=site` に切替
  - 30日保持用の cleanup SQL と migration SQL を追加
  - プライバシーポリシーへ解析Cookie利用と保持期間（30日）を明記
  - `GET /api/metrics/v2/summary` の legacy合算を撤去し、v2正本へ統一
  - session first-touch テーブル（`analytics_session_attribution`）を追加し、direct補完基盤を実装
  - `npm run typecheck` / `npm run build` を通過
- Remaining:
  - 日次cleanupの実行をCron等で自動化する運用設定（本番環境側）
- Lessons:
  - 正本切替では「計測方式」と「表示母数の整合」を最優先で決めるべき

## Context and Orientation

- 対象アプリ / サービス: `apps/makotoclub/frontend`
- 関連する主要ディレクトリ:
  - `apps/makotoclub/frontend/functions/`
  - `apps/makotoclub/frontend/functions/db/`
  - `apps/makotoclub/frontend/app/routes/`
  - `apps/makotoclub/frontend/app/components/`
- 関係する docs:
  - `docs/architecture.md`
  - `docs/development.md`
  - `docs/test_strategy.md`
  - `docs/config_rules.md`

## Plan of Work

- `metrics` APIにv2 summary/eventsを追加し、将来の分析向けの基盤を作る
- `onRequest` でSSRページレスポンス時にアクセスヒットを自動記録する
- フロントは `root.tsx` で共通トラッカーを動かし、ルート遷移ごとにイベント送信する
- トップは `/api/metrics/v2/summary?scope=site` を使って全体PV表示に切替える
- DB migrationと削除SQL、プライバシーポリシーを同期して運用可能な状態にする

## Concrete Steps

- `rg -n "metrics/pv|page_view_counts|access_logs" apps/makotoclub/frontend`
- `edit functions/_api/metrics.ts`
- `edit functions/[[path]].ts`
- `add app/components/common/page-analytics-tracker.tsx`
- `edit app/root.tsx`
- `edit app/routes/_index.tsx`
- `add functions/db/analytics_v2_migration.sql`
- `add functions/db/analytics_v2_cleanup.sql`
- `edit app/routes/privacy.tsx`
- `npm run typecheck`
- `npm run build`

## Validation and Acceptance

- `npm run typecheck` が成功
- `npm run build` が成功
- `/api/metrics/v2/summary?scope=site` が `count/todayCount` を返す
- トップで全体PV（累計/今日）が表示される

## Idempotence and Recovery

- migrationは `CREATE TABLE IF NOT EXISTS` を用い、再実行可能にする
- cleanup SQL は再実行しても副作用が限定される
- 失敗時は変更ファイル単位で `git restore -- <file>` で復元可能

## Artifacts and Notes

- 作業対象:
  - `apps/makotoclub/frontend/functions/_api/metrics.ts`
  - `apps/makotoclub/frontend/functions/[[path]].ts`
  - `apps/makotoclub/frontend/app/root.tsx`
  - `apps/makotoclub/frontend/app/routes/_index.tsx`
  - `apps/makotoclub/frontend/functions/db/*.sql`
  - `apps/makotoclub/frontend/app/routes/privacy.tsx`
