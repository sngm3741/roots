# PVカウンタ（BOT除外・累計表示）

この ExecPlan は生きている文書です。作業が進むにつれて、`Progress`、`Surprises & Discoveries`、`Decision Log`、`Outcomes & Retrospective` を必ず更新すること。

Roots では ExecPlan ファイルを `docs/DEVLOG/` 配下に置き、  
このドキュメントは `docs/architecture.md` および `docs/ddd/**` に従って維持する。

## Purpose / Big Picture

- このタスクの目的: 無料プラン前提でBOTを簡易除外した累計PVをトップページに表示する。
- 完了するとユーザー/システム視点で何ができるようになるか: トップページで累計PVを確認できる。
- 動作確認のイメージ（URL / コマンド etc）:
  - トップページアクセスで `page_view_counts` が増える
  - `POST /api/metrics/pv` のレスポンスでカウント確認

## Progress

- [x] (2025-12-31 14:10) 既存構成とAPIハンドラの調査完了
- [x] (2025-12-31 14:10) 保存方式（path別累計）・BOT除外方針の確定
- [x] (2025-12-31 14:20) D1テーブル追加（migration）
- [x] (2025-12-31 14:20) PVカウントAPI実装
- [x] (2025-12-31 14:20) トップページ表示の実装

## Surprises & Discoveries

- Observation: Cloudflare Bot Managementが無料プランでは使えない
  - Evidence: 事前確認
  - Files: N/A

## Decision Log

- Decision: BOT除外はUser-Agentの簡易判定で行う
  - Rationale: Bot Managementが利用不可のため
  - Date/Author: 2025-12-31 / 太一
- Decision: 表示は累計PVのみ、トップページ限定
  - Rationale: 最小要件を優先
  - Date/Author: 2025-12-31 / 太一

## Outcomes & Retrospective

- Achieved:
- Remaining:
- Lessons:

## Context and Orientation

- 対象アプリ / サービス: `apps/makotoclub/frontend`（Cloudflare Pages Functions）
- 関連する主要ディレクトリ:
  - `apps/makotoclub/frontend/functions/`（API実装）
  - `apps/makotoclub/frontend/functions/db/`（migration）
  - `apps/makotoclub/frontend/app/routes/_index.tsx`（表示）
- 関係する docs:
  - `docs/architecture.md`
  - `docs/development.md`

## Plan of Work

1. `page_view_counts` テーブルの追加
2. PVカウントAPI（BOT除外）を実装
3. トップページで累計PV表示
4. ローカルでの動作確認

## Concrete Steps

- 作業ディレクトリ:
  - `roots/`
- 予定コマンド:
  - `wrangler d1 execute makotoclub --local --file functions/db/page_view_counts_migration.sql`

## Risks / Mitigations

- リスク: UA判定の誤検知でPVが過小/過大になる  
  - 対策: キーワードの調整、後日Bot Managementに移行
