# トップページ設計（MakotoClub）

共通ルール: `apps/makotoclub/docs/frontend_common.md` に準拠。差分のみ記載。

## 1. 概要
- 目的: 店舗探索を促進し、ユーザーが店舗詳細へ進むことを最優先とする。アンケート投稿導線は副次的に設置。
- メインCTA: 店舗探索（検索/フィルタ → 一覧/詳細）。
- サブCTA: アンケート投稿（PayPay1000円キャンペーン導線）。

## 2. セクション構成（上から順）
1. ヒーロー: キャッチコピー + メインCTA（店舗探し） + サブCTA（アンケート投稿）。
2. 検索/フィルタ: キーワード検索（店名/エリア/業種） + プリセットセレクト（都道府県/業種/ジャンル）。
3. 新着アンケート: 最新アンケートカードのグリッド。
4. 新着店舗: 最新店舗カードのグリッド。
5. キャンペーン告知: 「アンケート投稿でPayPay1000円」バナー。
6. フッター。

ヘッダー/フッターは `frontend_common.md` の共通ルールを使用（モバイルはハンバーガー＋ドロワー）。

## 3. レイアウト（差分）
- コンテナ幅: `max-w-5xl mx-auto px-4`（共通ルール通り）。
- セクション余白: `py-16` を基本。
- グリッド:
  - カード一覧: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`。

## 4. UI要素
- ヒーロー
  - 見出し: 店舗探索を前面に出す。「みんなのリアルな声で、お店探しをアップデート」系。
  - CTA: Primary「店舗を探す」→ `/stores`。Secondary「アンケートを投稿」→ `/surveys/new`。
  - 背景: シェイプ/グラデ or 既存の画像を流用（優先度低）。

- 検索/フィルタ
  - キーワード: 店名/エリア/業種をまとめた1入力。例: placeholder「店名・エリア・業種で検索」。
  - プリセット: select で 都道府県 / 業種。  
    - 都道府県は全件リスト（共通化）。  
    - 業種は既存APIのクエリに合わせる。
  - 検索ボタン: Primary。
  - レイアウト: モバイル1カラム、`md`で2カラムに分割可能。

- 新着アンケートカード（一覧で表示する要素）
  - 店名/支店名
  - 都道府県/エリア
  - 訪問時期
  - 満足度（星表示 + 数値）
  - コメント抜粋（最優先: customerComment → staff/workEnvironment → etc）
  - 女子給/待機時間
  - 投稿日
  - CTA: 「詳しく見る」→ `/surveys/:id`

- 新着店舗カード（一覧で表示する要素）
  - 店名/支店名
  - 都道府県/エリア
  - 業種/ジャンル
  - 平均満足度
  - 女子給（平均 or 単価ラベル）
  - アンケート件数/役立ち件数
  - 最終更新日（あれば）
  - CTA: 「詳しく見る」→ `/stores/:id`

- キャンペーン告知
  - 文言: 「アンケート投稿でPayPay 1000円プレゼント」
  - CTA: `/surveys/new`

## 5. データ仕様（必要フィールド）
- 店舗カード: id, storeName, branchName, prefecture, area, category(industry), genre, averageRating, averageEarning/averageEarningLabel, surveyCount/helpfulCount, updatedAt/createdAt(optional)。
- アンケートカード: id, storeName/branch, storePrefecture/area, visitedPeriod, rating, customerComment等の抜粋、averageEarning, waitTimeHours, createdAt。
- 検索/フィルタ: クエリパラメータ (name, prefecture, area, industry, genre, page, limit, sort) を `/api/stores` に渡す。

## 6. ユースケース / シナリオ
- ユーザーはトップ到達 → 検索ボックス/プリセットで条件入力 → 店舗一覧へ → 店舗詳細 → 口コミ閲覧。
- 新着アンケート/店舗のカードから詳細へショートカット。
- キャンペーンバナーからアンケート投稿へ。

## 7. イベント仕様
- 検索フォーム submit: `/stores` にクエリ付きで遷移。
- カードクリック/ボタンクリック: 対応する詳細ページに遷移。
- キャンペーンCTA: `/surveys/new` に遷移。

## 8. バリデーション仕様（トップではなし）
- 検索入力は未入力でも可。クエリ文字列にそのまま載せる。

## 9. 権限・認可
- 特になし。全体公開ページ。

## 10. 備考
- トップでの数字表示（件数など）は、API応答に依存するため、値が取れない場合はハイフンで表示。
- 共通色/タイポは `frontend_common.md` に従う。アクセントは現行のピンク/ブルー系で統一。
