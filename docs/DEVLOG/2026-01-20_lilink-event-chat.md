# lilink イベント検索チャット（D1）

この ExecPlan は生きている文書です。作業が進むにつれて、`Progress`、`Surprises & Discoveries`、`Decision Log`、`Outcomes & Retrospective` を必ず更新すること。

Roots では ExecPlan ファイルを `docs/DEVLOG/` 配下に置き、  
このドキュメントは `docs/architecture.md` および `docs/ddd/**` に従って維持する。

## Purpose / Big Picture

- このタスクの目的: lilink のチャットで「今日/明日/今週/今月」などの日付ベースの質問にイベント一覧で返答する。
- 完了するとユーザー/システム視点で何ができるようになるか: プロフィールページのチャットから、ユーザー固有イベントを日付条件で問い合わせできる。
- 動作確認のイメージ（URL / コマンド etc）: `/{slug}` のチャットで「明日のイベントは？」と送る。

## Progress

- [x] (2026-01-20 18:40) 既存コード・docs の調査完了
- [x] (2026-01-20 18:40) データ設計（D1スキーマ）を確定
- [x] (2026-01-20 18:40) D1バインドとマイグレーション追加
- [x] (2026-01-20 18:40) チャットAPIで日付/キーワード抽出とD1検索実装
- [x] (2026-01-20 18:40) フロントからuserID（slug）を渡す実装
- [ ] (2026-01-20 18:40) 動作確認

## Surprises & Discoveries

- Observation: なし
  - Evidence: なし
  - Files: なし

## Decision Log

- Decision: イベント検索はD1の文字列日付（YYYY-MM-DD）で範囲検索し、部分一致は `LIKE` で行う。
  - Rationale: まずは単純に日付/キーワードの検索を成立させるため。
  - Date/Author: 2026-01-20 / codex
- Decision: userID はプロフィールの `slug` をそのまま使用する。
  - Rationale: 既存ルーティングが `/:slug` であるため、追加の認証実装なしで最短に繋げられる。
  - Date/Author: 2026-01-20 / codex
- Decision: 日付ワード検出時はD1検索結果をLLMに渡してRAG応答にする。
  - Rationale: 検索結果を根拠に回答させ、曖昧な推測を避けるため。
  - Date/Author: 2026-01-20 / codex

## Outcomes & Retrospective

- Achieved:
- Remaining:
- Lessons:

## Context and Orientation

- 対象アプリ / サービス: apps/lilink/frontend
- 関連する主要ディレクトリ:
  - `apps/lilink/frontend/functions/api/chat.ts`
  - `apps/lilink/frontend/app/components/profile/ChatbotCard.tsx`
  - `apps/lilink/frontend/app/components/profile/ProfilePage.tsx`
  - `apps/lilink/frontend/wrangler.toml`
  - `apps/lilink/frontend/migrations/`
- 関係する docs:
  - `docs/architecture.md` の Backend/Frontend 構成
  - `docs/config_rules.md`

## Plan of Work

- 既存のチャットAPI/フロント連携を確認
- D1イベントテーブルのスキーマを定義しマイグレーションを追加
- wrangler.toml にD1バインドを追加
- チャットAPIに日付/キーワード解析とD1検索を追加
- フロントから `slug` をAPIに渡す
- 簡易動作確認

## Concrete Steps

- `rg -n "chat" apps/lilink/frontend`
- `mkdir -p apps/lilink/frontend/migrations`
- `cat apps/lilink/frontend/wrangler.toml`
- `sed -n '1,200p' apps/lilink/frontend/functions/api/chat.ts`
