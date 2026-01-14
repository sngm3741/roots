# MakotoClub AI会話（Workers AI）導入計画

この ExecPlan は生きている文書です。作業が進むにつれて、`Progress`、`Surprises & Discoveries`、`Decision Log`、`Outcomes & Retrospective` を必ず更新すること。

Roots では ExecPlan ファイルを `docs/DEVLOG/` 配下に置き、  
このドキュメントは `docs/architecture.md` および `docs/ddd/**` に従って維持する。

## Purpose / Big Picture

- このタスクの目的: チャットUIから条件を聞き出し、既存の抽出APIを使って店舗候補を提示する会話体験を作る。
- 完了するとユーザー/システム視点で何ができるようになるか: RAG本実装前に、会話での相談→候補提示→リンク誘導ができる。
- 動作確認のイメージ（URL / コマンド etc）: `http://localhost:8788/rag` で会話UIを表示し、入力に応じて候補が返る。

## Progress

- [x] (2026-01-14 19:10) 既存コード・docs の調査完了
- [x] (2026-01-14 19:10) 会話API設計（Workers AI / 既存抽出API連携）を確定
- [x] (2026-01-14 19:40) フロント会話UIの設計と実装
- [x] (2026-01-14 19:40) API実装（/api/ai/chat）と結線
- [ ] (2026-01-14 00:00) 動作確認と微調整

## Surprises & Discoveries

- Observation: まだ記録なし
  - Evidence: -
  - Files: -

## Decision Log

- Decision: 会話LLMはWorkers AIを利用し、RAG（ベクトル検索）は後回しにする
  - Rationale: まず会話体験の成立を優先し、抽出ロジックは既存の /api/rag を使う
  - Date/Author: 2026-01-14 / sngm3741

## Outcomes & Retrospective

- Achieved:
- Remaining:
- Lessons:

## Context and Orientation

- 対象アプリ / サービス: apps/makotoclub/frontend
- 関連する主要ディレクトリ:
  - `apps/makotoclub/frontend/app/routes/rag.tsx`
  - `apps/makotoclub/frontend/functions/[[path]].ts`
  - `apps/makotoclub/frontend/app/lib/*`
- 関係する docs:
  - `docs/architecture.md`
  - `docs/development.md`
  - `docs/ddd/index.md`
  - `docs/ddd/layers/overview.md`
  - `docs/config_rules.md`

## Plan of Work

- 既存の API 構成と RAG 用抽出API（/api/rag）を整理
- Workers AI の呼び出し方法と環境変数の置き場を決める
- 会話APIの入力/出力フォーマットを定義（システム/ユーザー/ツール）
- rag.tsx のUIを会話型に更新し、APIと接続
- エラー時の文言・フォールバック挙動を整える

## Concrete Steps

- `cd /Users/sngm3741/Workspace/roots`
- `rg -n "rag|ai|chat" apps/makotoclub/frontend`
- `rg -n "Workers AI" apps/makotoclub/frontend`
- `open http://localhost:8788/rag`
