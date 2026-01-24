# lilink: JSON運用への切替（D1撤去）

この ExecPlan は生きている文書です。作業が進むにつれて、`Progress`、`Surprises & Discoveries`、`Decision Log`、`Outcomes & Retrospective` を必ず更新すること。

Roots では ExecPlan ファイルを `docs/DEVLOG/` 配下に置き、
このドキュメントは `docs/architecture.md` および `docs/ddd/**` に従って維持する。

## Purpose / Big Picture

- このタスクの目的: D1とAPIを撤去し、JSONファイルのみでlilinkページを運用できるようにする。
- 完了するとユーザー/システム視点で何ができるようになるか:
  - 各ユーザーページはJSONの手編集で管理できる。
  - /edit と DB 依存がなくなり、UI/UXの作り込みに集中できる。
- 動作確認のイメージ（URL / コマンド etc）:
  - `/kiriko` など既存ページがJSONから表示される。
  - `npm run preview` でエラーなく起動する。

## Progress

- [x] (2026-01-24 20:10) 既存D1/API/ルートの調査完了
- [x] (2026-01-24 20:10) D1/APIと/editルートの削除
- [x] (2026-01-24 20:10) JSON読み込みへの切替
- [ ] (2026-01-24 20:10) UI整理と動作確認

## Surprises & Discoveries

- Observation:
  - Evidence:
  - Files:

## Decision Log

- Decision: D1を撤去し、JSONのみでユーザーごとのページを管理する。
  - Rationale: 30人規模の手作業運用を前提とし、UI/UX優先で作り込むため。
  - Date/Author: 2026-01-24 / taiichi
- Decision: `/edit` と `/api/page` を削除し、外部データはJSONのみとする。
  - Rationale: 運用と実装の複雑さを下げ、デザインへ集中するため。
  - Date/Author: 2026-01-24 / taiichi

## Outcomes & Retrospective

- Achieved:
- Remaining:
- Lessons:

## Context and Orientation

- 対象アプリ / サービス: `apps/lilink/frontend`
- 関連する主要ディレクトリ:
  - `apps/lilink/frontend/app/data/`
  - `apps/lilink/frontend/app/routes/`
  - `apps/lilink/frontend/functions/api/*`
  - `apps/lilink/frontend/wrangler.toml`
- 関係する docs:
  - `docs/architecture.md`
  - `docs/development.md`
  - `docs/config_rules.md`

## Plan of Work

- 既存のD1/API/編集ルートの依存関係を調べる。
- API(/api/page,/api/links,/api/profile)と/editルートを削除する。
- JSONファイルを `app/data/pages/*.json` に配置し、読み込みロジックを更新する。
- fallbackPages をJSONへ移行し、ページ取得をJSONのみで行う。
- UI側の不要導線（編集ボタン等）を整理する。

## Concrete Steps

- `rg -n "api/page|api/links|api/profile" apps/lilink/frontend`
- `rg -n "edit" apps/lilink/frontend/app/routes`
- `npm run preview`
