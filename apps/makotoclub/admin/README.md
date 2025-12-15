# MakotoClub Admin

Cloudflare Pages + Functions で動作する管理用フロントエンドです。店舗情報とアンケートを管理するためのシンプルな UI と、モックの API を同梱しています。
運用環境では Cloudflare Access での保護を前提としています（このリポジトリのモックでは認証を省略）。

## 機能
- 店舗の作成・更新・削除
- アンケートの作成・更新・削除
- 下書きアンケートの取得・編集

## 開発
```bash
cd apps/makotoclub/admin
npm install
npm run dev
```

モック API は Pages Functions（`functions/api/**`）で提供しており、開発サーバー上でそのまま利用できます。永続化は行わないため、再起動するとデータは初期化されます。
