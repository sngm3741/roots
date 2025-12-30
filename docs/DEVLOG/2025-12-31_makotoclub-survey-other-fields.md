# MakotoClub: 業種/勤務形態の「その他」入力を draft に保存

この ExecPlan は生きている文書です。作業が進むにつれて、`Progress`、`Surprises & Discoveries`、`Decision Log`、`Outcomes & Retrospective` を必ず更新すること。

Roots では ExecPlan ファイルを `docs/DEVLOG/` 配下に置き、  
このドキュメントは `docs/architecture.md` および `docs/ddd/**` に従って維持する。

## Purpose / Big Picture

- このタスクの目的: 業種/勤務形態の「その他」入力をフロントで受け付け、survey_drafts に保存して管理画面で確認できるようにする。
- 完了するとユーザー/システム視点で何ができるようになるか: ユーザー投稿の「その他」内容を管理者が確認し、必要に応じて業種/勤務形態の候補を追加できる。
- 動作確認のイメージ（URL / コマンド etc）: `http://localhost:8788/surveys/new` で「その他」を選択すると入力欄が出現し、admin のユーザー投稿一覧に値が表示される。

## Progress

- [x] (2025-12-31 00:00) 既存コード・docs の調査完了
- [x] (2025-12-31 00:00) 仕様整理（保存先は survey_drafts のみ）
- [x] (2025-12-31 00:00) フロント: 「その他」選択と入力欄の追加
- [x] (2025-12-31 00:00) API/DB: survey_drafts に other フィールドを保存
- [x] (2025-12-31 00:00) Admin: draft 一覧に other 値を表示
- [ ] (2025-12-31 00:00) 動作確認

## Surprises & Discoveries

- Observation: 業種/勤務形態は API 側で必須チェックがあるが、draft 保存に限定する運用で回避可能。
  - Evidence: `apps/makotoclub/frontend/functions/[[path]].ts`
  - Files: `apps/makotoclub/frontend/functions/[[path]].ts`

## Decision Log

- Decision: 「その他」の自由記入は survey_drafts のみに保存する。
  - Rationale: 管理者が目視で判断し、必要に応じて業種/勤務形態の候補を更新する運用と整合するため。
  - Date/Author: 2025-12-31 / Codex

## Outcomes & Retrospective

- Achieved:
- Remaining:
- Lessons:

## Context and Orientation

- 対象アプリ / サービス: apps/makotoclub/frontend, apps/makotoclub/admin, D1 (survey_drafts)
- 関連する主要ディレクトリ:
  - `apps/makotoclub/frontend/app/routes/surveys.new.tsx`
  - `apps/makotoclub/frontend/functions/[[path]].ts`
  - `apps/makotoclub/frontend/functions/db/schema.sql`
  - `apps/makotoclub/admin/functions/api/surveys/drafts.ts`
  - `apps/makotoclub/admin/src/routes/surveys/DraftSurveyListPage.tsx`
  - `packages/makotoclub-shared/src/survey.ts`
- 関係する docs:
  - `docs/architecture.md` の apps/frontend
  - `docs/development.md` の ExecPlan ルール

## Plan of Work

- surveys/new の業種・勤務形態に「その他」を追加し、選択時のみテキスト入力欄をアニメーション表示する。
- フロントの action で other 値を取得し、/api/surveys の payload に追加する。
- D1 の survey_drafts に `industry_other` / `work_type_other` を追加し、insert で保存する。
- admin の draft 一覧で「その他」の値を表示する。

## Concrete Steps

- 作業ディレクトリ:
  - `roots/`
  - `apps/makotoclub/frontend`
  - `apps/makotoclub/admin`
  - `docs/DEVLOG/`

- 予定コマンド:
  - `rg -n "industry|workType" apps/makotoclub/frontend/app/routes/surveys.new.tsx`
  - `rg -n "survey_drafts" apps/makotoclub/frontend/functions/[[path]].ts`
