# lilink: リンクカードAPI分割と個別保存

この ExecPlan は生きている文書です。作業が進むにつれて、`Progress`、`Surprises & Discoveries`、`Decision Log`、`Outcomes & Retrospective` を必ず更新すること。

Roots では ExecPlan ファイルを `docs/DEVLOG/` 配下に置き、
このドキュメントは `docs/architecture.md` および `docs/ddd/**` に従って維持する。

## Purpose / Big Picture

- このタスクの目的: リンクカードを個別保存できるAPIを導入し、編集UIの体験を改善する。
- 完了するとユーザー/システム視点で何ができるようになるか:
  - カード単位で保存/削除ができ、問題のあるカードが他の保存を妨げない。
  - 編集モーダルの保存が軽くなり、UXが向上する。
- 動作確認のイメージ（URL / コマンド etc）:
  - `/kiriko/edit` でカードの編集→保存が単体で成功する。
  - 既存の `/api/page` は GET で引き続き取得可能。

## Progress

- [x] (2026-01-24 18:40) 既存API/DB/型の調査完了
- [x] (2026-01-24 18:40) /api/links の CRUD 設計確定
- [x] (2026-01-24 19:10) D1アクセス実装とバリデーションを追加
- [x] (2026-01-24 19:10) フロントを個別保存に切替
- [ ] (2026-01-24 18:40) 動作確認と微調整

## Surprises & Discoveries

- Observation: 
  - Evidence: 
  - Files: 

## Decision Log

- Decision: `/api/links` と `/api/links/:id` を導入し、/api/page のPUTは使わない。
  - Rationale: 個別保存の要件とRESTの分かりやすさを優先。
  - Date/Author: 2026-01-24 / taiichi
- Decision: プロフィール編集は `/api/profile` で個別に保存する。
  - Rationale: `/api/page` の全件更新を避け、リンク個別保存と整合させる。
  - Date/Author: 2026-01-24 / taiichi

## Outcomes & Retrospective

- Achieved:
- Remaining:
- Lessons:

## Context and Orientation

- 対象アプリ / サービス: `apps/lilink/frontend`
- 関連する主要ディレクトリ:
  - `apps/lilink/frontend/functions/api/page.ts`
  - `apps/lilink/frontend/functions/api/links.ts`（新規）
  - `apps/lilink/frontend/app/routes/$slug.edit.tsx`
  - `apps/lilink/frontend/app/types/profile.ts`
- 関係する docs:
  - `docs/architecture.md`
  - `docs/ddd/**`
  - `docs/config_rules.md`

## Plan of Work

- 既存の `/api/page` 実装・D1スキーマ・型を確認する。
- `/api/links` に必要な入出力（slug, id, link payload）を定義する。
- 新しいAPIハンドラを実装し、個別の作成/更新/削除を行えるようにする。
- 編集モーダルの保存ボタンを個別保存に切り替える。
- 既存の全体保存ボタンは残しつつ、リンク保存は個別化する。
- UIの保存結果メッセージを整える。

## Concrete Steps

- `rg -n "links" apps/lilink/frontend/functions/api/page.ts`
- `rg -n "LinkInput|PageData" apps/lilink/frontend/app/types/profile.ts`
- `npm run preview` で動作確認
