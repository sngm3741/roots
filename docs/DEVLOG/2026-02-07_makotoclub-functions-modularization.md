# makotoclub functions モジュール分割

この ExecPlan は生きている文書です。作業が進むにつれて、`Progress`、`Surprises & Discoveries`、`Decision Log`、`Outcomes & Retrospective` を必ず更新すること。

Roots では ExecPlan ファイルを `docs/DEVLOG/` 配下に置き、
このドキュメントは `docs/architecture.md` および `docs/ddd/**` に従って維持する。

## Purpose / Big Picture

- このタスクの目的: `apps/makotoclub/frontend/functions/[[path]].ts` の巨大化を解消し、保守性と変更容易性を上げる
- 完了するとユーザー/システム視点で何ができるようになるか: API機能を責務単位で追跡しやすくなり、機能追加時の影響範囲が狭くなる
- 動作確認のイメージ（URL / コマンド etc）:
  - `npm run typecheck`
  - `npm run build`
  - 主要API（stores/surveys/comments/metrics）のレスポンス仕様が維持される

## Progress

- [x] (2026-02-07 14:35) 既存コードと設計ルール（architecture / development / ddd / config_rules）の再確認
- [x] (2026-02-07 14:40) 分割方針の決定（shared + route handler 方式）
- [x] (2026-02-07 18:10) `functions/_shared` に型・変換・共通ユーティリティを抽出
- [x] (2026-02-07 18:15) `functions/_api` に comments / metrics / surveys / stores ハンドラを分離
- [x] (2026-02-07 18:18) `functions/[[path]].ts` をルーティング中心へ縮小（2225行 → 926行）
- [x] (2026-02-07 18:19) `typecheck` / `build` / 差分レビューで最終確認

## Surprises & Discoveries

- Observation: ルート定義だけでなく、型・パーサ・マッパー・セキュリティ関数が1ファイルに混在している
  - Evidence: `apps/makotoclub/frontend/functions/[[path]].ts` が 2200 行超
  - Files: `apps/makotoclub/frontend/functions/[[path]].ts`

## Decision Log

- Decision: 先に「共通関数」抽出、その後「ルートハンドラ」抽出の順で進める
  - Rationale: 依存点を固定してから責務分割した方が差分の安全性が高い
  - Date/Author: 2026-02-07 / codex
- Decision: admin未公開方針に合わせ、分割対象は公開中のfrontend APIを優先する
  - Rationale: 影響範囲が大きい公開導線の保守性を最優先で上げるため
  - Date/Author: 2026-02-07 / codex
- Decision: ルート分岐は `[[path]].ts` に残し、個別処理は `_api/*` に委譲する構成に統一
  - Rationale: エントリポイントの責務を「ルーティングと共通前処理」に限定し、機能ごとに変更を局所化できるため
  - Date/Author: 2026-02-07 / codex

## Outcomes & Retrospective

- Achieved:
- `functions/[[path]].ts` のサイズを 2225 行から 926 行へ削減
- 共有ロジックを `functions/_shared` に抽出（types / mappers / parsers / security / db-helpers / constants）
- APIロジックを `functions/_api` に分離（comments / metrics / surveys / stores）
- `npm run typecheck` と `npm run build` の通過を確認
- Remaining:
- OGP / uploads / ai-chat のさらなる分割（第2段）
- Lessons:
- 先に shared を固定してから route 分割すると、型崩れを最小化できる

## Context and Orientation

- 対象アプリ / サービス: `apps/makotoclub/frontend`
- 関連する主要ディレクトリ:
  - `apps/makotoclub/frontend/functions/`
  - `apps/makotoclub/frontend/app/lib/`
  - `apps/makotoclub/frontend/app/routes/`
- 関係する docs:
  - `docs/architecture.md`
  - `docs/development.md`
  - `docs/config_rules.md`
  - `docs/ddd/index.md`
  - `docs/ddd/layers/overview.md`
  - `docs/ddd/rules/data-access.md`

## Plan of Work

- 既存 `[[path]].ts` から型・マッパー・パーサ・リクエスト補助を `functions/_shared` に抽出する
- comments / metrics / surveys / stores のAPI処理を `functions/_api` に分離する
- `handleApi` は route match と handler 呼び出しのみに整理する
- 既存UIが依存するレスポンスJSONの互換性を維持する
- 最後に `typecheck` と `build` を実行して壊れを検出する

## Concrete Steps

- `wc -l apps/makotoclub/frontend/functions/[[path]].ts`
- `rg -n "^const |^type |^  // (GET|POST|PUT|ADMIN)" apps/makotoclub/frontend/functions/[[path]].ts`
- `mkdir -p apps/makotoclub/frontend/functions/_shared apps/makotoclub/frontend/functions/_api`
- 共通モジュールを作成し、`[[path]].ts` の参照先を置換
- APIハンドラを分離し、`handleApi` の分岐を削減
- `npm run typecheck && npm run build`

## Validation and Acceptance

- `apps/makotoclub/frontend` で `npm run typecheck` が成功する
- `apps/makotoclub/frontend` で `npm run build` が成功する
- `comments/stores/surveys/metrics` のレスポンス形が既存フロントの型と整合する

## Idempotence and Recovery

- このExecPlanの作業は再実行可能（既存ファイルを上書き編集）
- 失敗時は変更ファイル単位で巻き戻し可能（`git restore -- <file>` を利用）

## Artifacts and Notes

- 作業対象:
  - `apps/makotoclub/frontend/functions/[[path]].ts`
  - `apps/makotoclub/frontend/functions/_shared/*`
  - `apps/makotoclub/frontend/functions/_api/*`
