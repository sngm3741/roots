# makotoclub store_comments 移行

この ExecPlan は生きている文書です。作業が進むにつれて、`Progress`、`Surprises & Discoveries`、`Decision Log`、`Outcomes & Retrospective` を必ず更新すること。

Roots では ExecPlan ファイルを `docs/DEVLOG/` 配下に置き、
このドキュメントは `docs/architecture.md` および `docs/ddd/**` に従って維持する。

## Purpose / Big Picture

- このタスクの目的: survey_comments を廃止し、store_comments へ移行して命名と実体のズレを解消する
- 完了するとユーザー/システム視点で何ができるようになるか: 店舗に紐づいたコメントとして一貫した命名・API・UIで扱える
- 動作確認のイメージ（URL / コマンド etc）:
  - `/surveys/:id` でコメント一覧/投稿が正常に動く
  - `/messages/:id` でコメント詳細（返信元＋返信一覧）が表示される

## Progress

- [x] (2026-01-11 14:55) 既存コード・API・DBの調査完了
- [x] (2026-01-11 14:55) 変更方針と影響範囲の合意
- [ ] (2026-01-11 23:50) DB: store_comments の作成と survey_comments の廃止
- [x] (2026-01-11 14:55) API: store_comments 参照/保存に切替
- [x] (2026-01-11 14:55) フロント: 型名/変数名/取得ロジックの置換
- [x] (2026-01-11 14:55) コメント詳細画面で返信一覧表示の対応
- [x] (2026-01-11 16:10) 店舗詳細にコメントUIを移行
- [ ] (2026-01-11 17:05) DB: store_comments に seq 連番を導入し、再生成する
- [ ] (2026-01-11 23:50) 動作確認

## Surprises & Discoveries

- Observation: まだなし
  - Evidence: -
  - Files: -

## Decision Log

- Decision: survey_comments は移行せず廃止し、store_comments を新規作成する
  - Rationale: 開発段階のため移行コストを避け、命名と実体を一致させる
  - Date/Author: 2026-01-11 / taiichi
- Decision: 投票テーブルを store_comment_votes に統一する
  - Rationale: コメントの所属を store に揃え、命名のズレを無くすため
  - Date/Author: 2026-01-11 / taiichi
- Decision: id はUUIDのまま維持し、店舗内連番は seq を追加で持つ
  - Rationale: 既存リンクや参照を壊さず、レス番号だけ安定化するため
  - Date/Author: 2026-01-11 / taiichi

## Outcomes & Retrospective

- Achieved:
- Remaining:
- Lessons:

## Context and Orientation

- 対象アプリ / サービス: apps/makotoclub/frontend
- 関連する主要ディレクトリ:
  - `apps/makotoclub/frontend/app/routes/`
  - `apps/makotoclub/frontend/app/components/`
  - `apps/makotoclub/frontend/app/lib/`
  - `apps/makotoclub/frontend/functions/[[path]].ts`
- 関係する docs:
  - `docs/architecture.md`
  - `docs/ddd/index.md`
  - `docs/ddd/layers/overview.md`

## Plan of Work

- 既存の survey_comments の参照箇所（API/フロント/型）を洗い出す
- store_comments テーブル定義と API の保存/取得を切替
- 型名と変数名を StoreComment / StoreCommentDetail に統一
- コメント詳細画面で「返信元＋返信一覧」を返すAPI/表示に対応
- 動作確認（一覧/投稿/詳細）

## Concrete Steps

- `rg -n "survey_comments|SurveyComment" apps/makotoclub/frontend`
- `rg -n "comments" apps/makotoclub/frontend/functions/[[path]].ts`
- store_comments のDDLを作成
- APIとフロントの置換
- 手動動作確認
