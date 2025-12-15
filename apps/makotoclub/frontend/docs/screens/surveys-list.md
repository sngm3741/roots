# アンケート一覧ページ設計（MakotoClub）

共通ルール: `apps/makotoclub/docs/frontend_common.md` に準拠。差分のみ記載。

## 1. 概要
- 目的: 最新のアンケートを一覧で見せ、詳細閲覧/店舗詳細への導線を確保する。
- メインCTA: 「アンケートを投稿」→ `/surveys/new`
- 対象: `/surveys`

## 2. レイアウト
- コンテナ: `max-w-5xl mx-auto px-4`
- 構成: 1) ページヘッダ 2) 検索/フィルタカード 3) 並び替えバー 4) カードグリッド 5) ページネーション
- グリッド: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`

## 3. UI要素
- 検索/フィルタカード
  - キーワード: 店名/エリア/業種の全文検索
  - プリセット: 都道府県 / 業種 / ジャンル（店舗一覧と同じリスト）
  - ボタン: 「検索する」
- 並び替え: 「新着順」「稼ぎ順」「評価順」
- カード表示項目:
  - 店名/支店名
  - 都道府県/エリア
  - 訪問時期
  - 評価
  - 年齢 / スペック
  - 女子給（平均稼ぎ）
  - コメント抜粋（customerComment → workEnvironmentComment → staffComment → fallback「コメントなし」）
  - 投稿日
  - CTA: 「詳しく見る」→ `/surveys/:id`
- 空状態: 「アンケートがありません。」表示
- ページネーション: 前へ/次へ、ページ番号表示（page/limit/totalに従う）

## 4. データ仕様
- 入力: API `/api/surveys`
  - クエリ: `page`, `limit`, `sort` (newest|oldest|earning|rating), `name?`, `prefecture?`, `industry?`, `genre?`
  - レスポンス: `SurveyListResponse`

## 5. ユースケース
- 新着順でざっと閲覧し、気になるものを詳細へ。
- 並び替えで過去の投稿を掘る。

## 6. イベント仕様
- 並び替えボタン押下 → `sort` クエリ付きで再ロード（スクロール位置を保つ）
- カード CTA → `/surveys/:id`
- 「アンケートを投稿」→ `/surveys/new`

## 7. バリデーション
- 表示のみ。入力は無し。

## 8. 備考
- 並び替えは必要最小限（新着/古い）。稼ぎ順などが必要ならAPI対応後に拡張する。
