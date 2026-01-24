# lilink Variant フラット化（親子廃止）

この ExecPlan は生きている文書です。作業が進むにつれて、`Progress`、`Surprises & Discoveries`、`Decision Log`、`Outcomes & Retrospective` を必ず更新すること。

## Purpose / Big Picture

- 目的: リンク編集を「Variantカードのフラット配置」に刷新し、親子構造を廃止する。
- 完了するとできること: `/edit` でカード単位に配置と内容を直感編集できる。`colStart/colSpan/rowSpan` に基づき表示側へ反映される。
- 動作確認: `/edit` でカードを追加/並び替え/配置変更 → `/:slug` で反映確認。

## Progress

- [x] (2026-01-22) 既存コード・データ構造の確認
- [x] (2026-01-22) LinkItem のフラット化（children 廃止）と移行方針決定
- [x] (2026-01-22) API/D1 スキーマ/seed の更新
- [x] (2026-01-22) `/edit` のUIをVariantカード編集に刷新
- [x] (2026-01-22) 表示側の配置反映（LinkList/Variant）
- [x] (2026-01-22) テンプレ/順番設定の撤去（データは固定値）
- [x] (2026-01-23) `/edit` を公開ページと同じ ProfilePage ベースに統合し、差分をインライン編集UIに限定
- [ ] (2026-01-22) 動作確認と残課題整理

## Surprises & Discoveries

- Observation: なし
  - Evidence:
  - Files:

## Decision Log

- Decision: 親子リンクは廃止し、フラットなカード配置に統一する。
  - Rationale: 編集体験の単純化と、12グリッド配置を最大限活用するため。
  - Date/Author: 2026-01-22 / codex
- Decision: カードのURLは必須にせず、空でも保存可能にする。
  - Rationale: 画像のみ/見出しのみのVariantを許可するため。
  - Date/Author: 2026-01-22 / codex
- Decision: Template/sections_orderは編集対象外とし、APIで固定値を保存する。
  - Rationale: UXを簡素化し、カード編集に集中させるため。
  - Date/Author: 2026-01-22 / codex
- Decision: LinkList を廃止し、VariantGrid でプロフィール/リンクを共通表示する。
  - Rationale: すべてを Variant の組み合わせとして扱い、特例コンポーネントをなくすため。
  - Date/Author: 2026-01-23 / codex

## Outcomes & Retrospective

- Achieved:
- Remaining:
- Lessons:

## Context and Orientation

- 対象: `apps/lilink/frontend`
- 主要ディレクトリ:
  - `apps/lilink/frontend/app/routes/$slug.edit.tsx`
  - `apps/lilink/frontend/app/components/organisms/LinkList.tsx`
  - `apps/lilink/frontend/app/components/molecules/variant/Variant.tsx`
  - `apps/lilink/frontend/functions/api/page.ts`
  - `apps/lilink/frontend/migrations/**`
  - `apps/lilink/frontend/seed/**`
- 関連ドキュメント:
  - `docs/architecture.md`
  - `docs/development.md`
  - `docs/test_strategy.md`

## Plan of Work

- LinkItem をフラットに変更し、children を削除する。
- D1 の `links` テーブルから `parent_id` 依存を外し、APIの親子処理を削除する。
- `/edit` を「Variantカードの編集パネル」に刷新し、配置UI（開始/終了/高さ）を維持する。
- 表示側で `colStart/colSpan/rowSpan` を使った配置を確認する。
- 既存データの移行（seed 反映）と動作確認を行う。

## Concrete Steps

- `rg "children" apps/lilink/frontend/app` で参照箇所を洗い出し
- `apps/lilink/frontend/functions/api/page.ts` の親子処理削除
- `apps/lilink/frontend/app/types/profile.ts` の LinkItem 定義更新
- `/edit` のUIをフラットカード編集に変更
- seed の再投入（必要なら）
