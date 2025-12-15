# MakotoClub フロントエンド Figma デザイン指示書（最新版）

この指示書は、現行実装（React Router v7 + Cloudflare Pages/Functions）と旧実装（Next.js 版 `__before/makoto-club/frontend`）、既存ドキュメントをすべて踏まえ、Figma で迷わずモックを起こすための決定版。甘えず網羅的に作り切ること。

## 0. 参考ソース（すべて参照すること）
- 共通設計: `docs/architecture.md`, `docs/development.md`, `docs/config_rules.md`, `docs/ddd/**`
- フロント共通ルール: `apps/makotoclub/docs/frontend_common.md`
- 画面別仕様: `apps/makotoclub/frontend/docs/screens/*.md`（top / stores-list / store-detail / surveys-list / survey-new）
- フロント移行メモ: `apps/makotoclub/frontend/docs/frontend_migration_notes.md`
- デプロイ: `apps/makotoclub/docs/frontend_cloudflare.md`
- API 契約: `apps/makotoclub/docs/api_contracts.md`
- 現行実装主要パス（React Router v7）:
  - ルート: `apps/makotoclub/frontend/app/routes/_index.tsx`, `stores.tsx`, `stores.$id.tsx`, `surveys.tsx`, `surveys.$id.tsx`, `surveys.new.tsx`, `admin.stores.tsx`
  - コンポーネント: `app/components/layout/*`, `app/components/cards/*`, `app/components/ui/*`
  - 型/データ: `app/types/*.ts`, `functions/db/schema.sql`
- 旧実装（Next.js）デザイン参照: `__before/makoto-club/frontend/src/app/*`, `src/features/*`, `src/components/*`, `src/config/site.ts`, `src/types/*`, `src/lib/*`, `globals.css`

## 1. プロダクト/ブランドの前提
- プロダクト: 風俗店舗の匿名アンケート/店舗検索サービス。店舗探索が最優先、投稿導線は副次だが常に提示。
- トーン: 素直・明快・信頼感。ピンク/バイオレット系アクセント（現行 `app/app.css` の `#f472b6` / `#a855f7`、旧 `globals.css` の同系色）を軸に、白ベース + ソフトなグラデ。子供っぽくならないよう余白とタイポで締める。
- フォント: 現行は Inter（Google Fonts 埋め込み）。旧は Geist。Figmaでは「San Francisco + Noto Sans JP」系で代替しつつ、見出しだけ少し表情をつける（例: Sora / Manrope など）。本文は読みやすさ優先。
- バックグラウンド: `#fff9fb` 系の薄ピンク。セクションは白カード + 1px ボーダー + ソフトシャドウ。
- アイコン/装飾: 過剰なイラスト禁止。薄いグラデのシェイプ程度。

## 2. グリッド/レイアウト共通ルール（frontend_common の厳守）
- コンテナ: `max-w-5xl mx-auto px-4` 基本。フォーム中心ページは `max-w-3xl`。
- セクション余白: `py-16`（トップ/一覧）、フォームは `py-12` 目安。
- グリッド: カード一覧は `1col`（SP）→ `2col`（md）→ `3col`（lg）。詳細/フォームは 1 カラム。
- ブレークポイント: Tailwind 標準（sm/md/lg）。必ずモバイルファースト。
- ボタン: shadcn/ui の `Button` ベース。Primary=ピンク系、Secondary=アウトライン or サブカラー。
- タグ/チップ: 角丸 pill、淡い背景（`bg-slate-100` 系）。

## 3. 共通コンポーネント（現行実装準拠）
- ヘッダー `app/components/layout/header.tsx`
  - 左: ロゴ（小さなグラデ丸 + `MakotoClub` タイポ）
  - 中: ナビ（/stores, /surveys, /surveys/new）
  - 右: CTA「店舗を探す」、SP はハンバーガー + ドロワー
  - 高さ 64px、薄いボーダー + ブラー背景
- フッター `app/components/layout/footer.tsx`
  - 左ロゴ/コピーライト、右に Terms/Privacy/Contact リンク
  - シンプルな 2 カラム、`py-8`
- カードシェル `CardShell`
  - 角丸 16px、1px ボーダー、hover シャドウ。全体クリック。
- ストアカード `StoreCard`
  - 上段: 県/エリア、店名+支店、タグ（業種/ジャンル）
  - 中段: ステータス `StatRow` (評価/稼ぎ/待機)、星 `RatingStars`
  - 下段: 件数タグ
- アンケートカード `SurveyCard`
  - 上段: 店舗位置/店名、タグ（訪問時期・年齢・スペック）
  - 中段: `StatRow` (評価/稼ぎ/待機)
  - 下段: コメント抜粋 + 投稿日
- パンくず: `Breadcrumbs` + `BreadcrumbLabelSetter`（詳細ページでタイトル反映）
- フォーム UI: Input/Select/Button/Range/RatingStars（shadcn/ui 風の角丸 + 1px ボーダー）

## 4. ページ別デザイン要件（現行 + 画面仕様 md 準拠）
### 4.1 トップ `/` （`_index.tsx`, `screens/top-page.md`）
- セクション順: ヒーロー → 検索/フィルタ → 新着アンケート → 新着店舗 → キャンペーン。
- ヒーロー: グラデ背景、見出し「みんなのリアルな声で、お店探しをアップデート。」CTA2個（店舗を探す / アンケート投稿）。
- 検索: キーワード + 都道府県 + 業種（セレクト）。`/stores` に GET 遷移。
- カード一覧: 3 カラムまで。0件時はテキストのみ。
- キャンペーン: PayPay 1000 円訴求カード + CTA `/surveys/new`。

### 4.2 店舗一覧 `/stores`（`stores.tsx`, `screens/stores-list.md`）
- ヘッダ: タイトル/説明 + サブCTA（アンケート投稿）。
- 検索フォーム: キーワード、都道府県、業種。`preventScrollReset`。ボタンは右寄せ。
- 並び替えバー: 新着/稼ぎ/評価の 3 ボタン（状態付き）。検索条件は hidden で引き継ぎ。
- カードグリッド: `StoreCard` 使用。0件メッセージ。
- ページネーション: 前/次 + 「現在/総ページ」表示。

### 4.3 店舗詳細 `/stores/:id`（`stores.$id.tsx`, `screens/store-detail.md`）
- ヘッダー: パンくず、店名+支店、県/エリア、業種/ジャンル、CTA「アンケートを投稿」。
- 概要カード: 総評（数値+星）、稼ぎ平均（`averageEarningLabel` or `unitPrice`）、待機時間（数値 or ラベル）、営業時間（あれば）。
- 最近のアンケート（最大10件、新着順固定）: 訪問時期/評価/年齢/稼ぎ/待機/コメント抜粋 + 「詳しく読む」ボタン。0件時は文言+CTA。

### 4.4 アンケート一覧 `/surveys`（`surveys.tsx`, `screens/surveys-list.md`）
- 検索フォーム: キーワード、都道府県、業種、ジャンル。ボタン右寄せ。
- 並び替え: 新着/稼ぎ/評価（3ボタン）。page hidden。
- カード: `SurveyCard` 使用。0件メッセージ。
- ページネーション: 前/次 + ページ数、`sort` クエリ維持。

### 4.5 アンケート詳細 `/surveys/:id`（`surveys.$id.tsx`）
- ヘッダ: パンくず、店名/支店、位置、訪問時期、評価、稼ぎ、待機、年齢、スペック。
- 本文: 4 ボックス（お客さん/スタッフ/職場環境/その他）。コメントが無ければ「コメントなし」。

### 4.6 アンケート投稿 `/surveys/new`（`surveys.new.tsx`, `screens/survey-new.md`）
- 説明: キャンペーン文言（メールで PayPay 送付）。
- フォーム項目（順守。必須項目に *）:
  1. 店舗名* / 支店名
  2. 都道府県* / 業種* / 働いた時期*（month） / 勤務形態*（在籍/出稼ぎ）
  3. 年齢*（18-50 range）+ 提供チェック（stateで必須管理）
  4. スペック*（60-140 range）+ 提供チェック
  5. 待機時間*（0/1/2/3/4/5h+ セレクト）
  6. 平均稼ぎ*（0/5/10/20/30 万帯）
  7. キャストバック*（60分単価）
  8. コメント（客層/スタッフ/職場/その他）
  9. 画像アップロード（最大5枚/5MB, 画像のみ, プレビューと削除, モーダル拡大）
  10. メールアドレス（任意, type=email）
  11. 満足度*（0-5 range, 0.1刻み, 星表示連動）
- バリデーション: 年齢/スペック/評価/数値は範囲チェック。必須未入力でエラーアラート表示。送信中 disable。
- 成功時 `/surveys` リダイレクト。

### 4.7 Admin 店舗登録 `/admin/stores`（`admin.stores.tsx`）
- 目的: 簡易 CMS。認証未実装だが UI は事務的に。
- フォーム: 店舗ID（空=自動）、店舗名*, 支店, 都道府県*, エリア, 業種*, ジャンル, 稼ぎ(60分), 営業時間 open/close, 平均総評(0-5, step 0.1)。2 カラムグリッド、保存ボタンは全幅。
- 一覧: 登録済み店舗カード（ID/店名/位置/業種/総評/稼ぎ、店舗ページリンク）。
- 旧実装にはさらに管理ダッシュボード（サーベイ編集/検索/ステータス管理）あり。今後拡張する余地としてレイアウトを破綻させない余白・カード設計にしておくこと。

### 4.8 静的ページ `/terms`, `/privacy`, `/contact`
- シンプルなドキュメントページで問題なし（旧実装 `__before/.../features/static/components/document-page.tsx` を参照）。本文幅は `max-w-3xl`。

## 5. データモデル / API 契約（`api_contracts.md`, `functions/db/schema.sql`, `app/types/*`）
- StoreSummary: id, storeName, branchName?, prefecture, area?, category(industry), genre?, unitPrice?, businessHours?, averageRating, averageEarning, averageEarningLabel?, waitTimeHours/Label?, surveyCount, helpfulCount?, createdAt?, updatedAt?
- StoreDetail: StoreSummary + surveys: SurveySummary[]
- SurveySummary/Detail: id, storeId, storeName/branch, storePrefecture/area, storeIndustry/genre?, visitedPeriod, workType, age, specScore, waitTimeHours, averageEarning, rating, comments (customer/staff/workEnvironment/etc), castBack?, emailAddress?, imageUrls?, helpfulCount?, createdAt/updatedAt
- ListResponse: items + page/limit/total
- D1 スキーマ: tables `stores` (基本情報 + rating + timestamps), `surveys` (店舗参照 +回答詳細+画像URL text serialize+helpful_count)。index は store_id, created_at。
- API エンドポイント: GET `/api/stores`, `/api/stores/:id`, `/api/stores/:id/surveys`, `/api/surveys`, `/api/surveys/:id`, POST `/api/surveys`; Admin: POST `/api/admin/stores`; Upload: POST `/api/uploads`.

## 6. 旧実装（Next.js `__before`）から拾うべき要素
- ビジュアル: ヒーローでフルブリード画像 + グラデオーバーレイ（`src/app/page.tsx`）、ピル状バッジ、PayPay バナー。
- レイアウト: `Breadcrumbs`, `Header/Footer` は 5xl コンテナ、背景は `#fff9fb`。
- 機能: Admin 周りでステータス/報酬/レビュー管理（`src/components/admin/*`）。現行UIは簡略化されているが、将来拡張できるようコンポーネント階層を意識する。
- カラー/トークン: `globals.css` で accent ピンク/バイオレット、selection 色設定。
- コンテンツ: features/home のセクション構成（Hero, SearchPanel, SurveyShowcase, StoreShowcase, Promo）。

## 7. デバイス/アクセシビリティ
- モバイル前提で 1 カラム崩れ防止。フォーム要素はタップ領域 44px 以上。
- 画像には `alt`。ボタン/リンクにラベル/aria-label。見出しレベル順守。
- 色コントラスト: ピンク系でも文字は濃いネイビー/スレートで AA 以上。

## 8. Cloudflare Pages/Functions 前提の制約（`frontend_cloudflare.md`）
- SSR は Web Streams、Node API 互換フラグ使用。デザイン上はフォーム/リンクが通常の GET/POST で成立するように。
- `.env` は Pages 側。API_BASE_URL は loader で渡す。環境変数に依存した表示を避ける。

## 9. Figma で用意すべきアウトプット
- ページフレーム: `/`, `/stores`, `/stores/:id`, `/surveys`, `/surveys/:id`, `/surveys/new`, `/admin/stores`, `/terms` の 8 画面。SP/PC 両方。
- コンポーネントライブラリ:
  - ボタン（Primary/Secondary/Destructive/Link, size sm/md/lg）
  - Input/Select/Textarea/Range/Badge/Tag/Chips
  - カード（StoreCard/SurveyCard/StatRow/TagList/CardShell）
  - レイアウト（Header/Footer/Breadcrumbs/Section）
  - モーダル（画像プレビュー用）
- カラートークン: 背景/カード/境界/テキスト/primary/secondary/警告。現行カラーをベースに 8-10 スウォッチ。
- タイポスケール: H1-H3, body, small, caption を決め打ち（見出しは太め、本文は 16px 前後）。
- アイコンセット: 最低限（検索、並び替え、画像削除/閲覧、ハンバーガー）。
- コンポーネントバリアント: ボタン状態（hover/active/disabled）、フォームエラー表示、0件表示。

## 10. 残課題・決めるべきこと
- 管理画面の認証/認可と情報密度（旧実装のステータス管理をどこまで持ち込むか）。
- 画像アップロード後のプレビューUX（ドラッグ&ドロップ採用の可否）。
- SEO/メタ情報（現行 root.tsx はシンプル、旧 Next は Metadata 設定あり）。
- 将来のダークモード対応有無。

## 11. デザイン原則まとめ（迷ったらここに戻る）
- 「店舗探索が最優先」を常に意識し、トップ・ヘッダー・フッターの主要導線は `/stores` に寄せる。アンケート投稿は常にセカンダリ。
- カードは情報を詰め込み過ぎない。最小必須フィールド（位置/業種/評価/稼ぎ/待機 + コメント1行）。
- 無い値は「-」や「コメントなし」で穴を空けない。件数ゼロ/エラーも静かに見せる。
- ピンク系を使うが、可愛さより「信頼感>行動促進」で配色/余白を決める。
