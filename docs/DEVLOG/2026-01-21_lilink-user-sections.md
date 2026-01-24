# lilink ユーザー別セクション構成と編集UI

この ExecPlan は生きている文書です。作業が進むにつれて、`Progress`、`Surprises & Discoveries`、`Decision Log`、`Outcomes & Retrospective` を必ず更新すること。

Roots では ExecPlan ファイルを `docs/DEVLOG/` 配下に置き、  
このドキュメントは `docs/architecture.md` および `docs/ddd/**` に従って維持する。

## Purpose / Big Picture

- このタスクの目的: lilink のプロフィールを「profile + links + 任意セクション」で一般化し、ユーザーが自分で組み替え・編集できるようにする
- 完了するとユーザー/システム視点で何ができるようになるか: テンプレ選択・任意セクション切替・リンク編集を自己操作で実行できる
- 動作確認のイメージ（URL / コマンド etc）: `/:slug` の表示と `/:slug/edit` の編集保存が動く

## Progress

- [x] (2026-01-21 00:00) 既存コード・docs の調査完了
- [x] (2026-01-21 00:00) D1スキーマ設計とマイグレーション追加
- [x] (2026-01-21 00:00) API（取得/保存）実装
- [x] (2026-01-21 00:00) フロント型と表示コンポーネント更新
- [x] (2026-01-21 00:00) 編集ページ実装
- [x] (2026-01-21 00:00) 初期データ（kiriko）投入用シード作成
- [ ] (2026-01-21 00:00) 動作確認

## Surprises & Discoveries

- Observation: （未記入）
  - Evidence:
  - Files:

## Decision Log

- Decision: 任意セクションのデータは種別ごとに保持し、切替時も破棄しない
  - Rationale: 「非表示保持」要件を満たし、テンプレ切替時のデータ消失を防ぐため
  - Date/Author: 2026-01-21 / codex
- Decision: 編集APIは `edit_token` が設定されている場合のみトークン必須とし、未設定時は許可する
  - Rationale: 認証基盤が未整備な段階での最小運用を成立させるため
  - Date/Author: 2026-01-21 / codex
- Decision: まずは編集トークン無しでシード投入し、UI/保存の動作確認を優先する
  - Rationale: 早期検証を優先し、認証導入は後から最小コストで追加するため
  - Date/Author: 2026-01-21 / codex

## Outcomes & Retrospective

- Achieved:
- Remaining:
- Lessons:

## Context and Orientation

- 対象アプリ / サービス: apps/lilink/frontend
- 関連する主要ディレクトリ:
  - `apps/lilink/frontend/app`
  - `apps/lilink/frontend/functions`
  - `apps/lilink/frontend/migrations`
- 関係する docs:
  - `docs/architecture.md`
  - `docs/development.md`
  - `docs/config_rules.md`

## Plan of Work

- D1 にプロフィール/リンク/任意セクションの保存領域を追加
- `/api/page` に取得/保存APIを追加
- 既存の ProfilePage をセクション構成に対応させる
- 編集ページでテンプレ/リンク/任意セクションを更新できるようにする

## Concrete Steps

- `sed -n '1,200p' apps/lilink/frontend/functions/api/chat.ts`
- `ls apps/lilink/frontend/migrations`
- `rg --files apps/lilink/frontend/app`
