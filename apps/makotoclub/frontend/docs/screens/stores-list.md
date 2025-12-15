# 店舗一覧ページ設計（MakotoClub）

共通ルール: `apps/makotoclub/docs/frontend_common.md` に準拠。差分のみ記載。  
この画面は探索重視。検索/フィルタで条件を絞り、カードから詳細へ遷移させる。

## 1. 概要
- 目的: 店舗を探しやすくし、詳細ページへの遷移を促す。
- メインCTA: 店舗カードからの「詳しく見る」→ `/stores/:id`
- サブCTA: アンケート投稿（ヘッダー/グローバルで提供）

## 2. レイアウト
- コンテナ: `max-w-5xl mx-auto px-4`, セクション余白 `py-16`
- 構成: 1) ページヘッダ 2) 検索/フィルタ 3) 結果カードグリッド 4) ページネーション
- グリッド: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`

## 3. UI要素
- ページヘッダ
  - タイトル: 「店舗一覧」
  - サブテキスト: 簡単な説明文

- 検索/フィルタ
  - キーワード（name）: 店名/エリア/業種で検索するテキストボックス
  - プリセット: selectで都道府県 / 業種 / ジャンル
  - ソート: optional（例: 新着/評価順）※実装時にAPI対応を確認
  - 検索ボタン: Primary
  - レイアウト: 2カラム構成を基本、モバイルは1カラム

- 店舗カード（表示要素）
  - 店名/支店名
  - 都道府県/エリア
  - 業種/ジャンル
  - 平均評価
  - 女子給（平均または単価ラベル）
  - アンケート件数/役立ち件数
  - 更新日（あれば）
  - CTA: 「詳しく見る」→ `/stores/:id`

- 空状態
  - 「店舗が見つかりませんでした」メッセージを表示

- ページネーション
  - 次/前リンクまたはページ番号（API仕様に合わせる）
- 並び替え
  - 新着順 / 稼ぎ順 / 評価順 の3ボタンを検索フォーム外に配置
  - クリックでクエリ送信、スクロール位置は維持（preventScrollReset）

## 4. データ仕様（必要フィールド）
- 入力: `name`, `prefecture`, `area`, `industry`, `genre`, `page`, `limit`, `sort?`
- 出力: `StoreSummary` 相当
  - id, storeName, branchName, prefecture, area, category(industry), genre, averageRating, averageEarning/averageEarningLabel, surveyCount/helpfulCount, updatedAt/createdAt(optional)

## 5. ユースケース / シナリオ
- ユーザーが条件を入力→検索→カードから詳細へ。
- 条件未入力でも新着順で一覧が出る。

## 6. イベント仕様
- フォーム submit → `/stores` にクエリ付きで遷移。
- カードの CTA クリック → `/stores/:id` へ遷移。

## 7. バリデーション
- 未入力許容。入力値はそのままクエリに載せる。

## 8. 権限
- 制限なし。
