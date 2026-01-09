# lilink フロントエンド

lilink の公開プロフィールページを React Router v7（SSR）+ Cloudflare Pages で配信する構成です。

## ローカル開発

```bash
npm install
npm run dev
```

## 型チェック

```bash
npm run typecheck
```

## Cloudflare Pages 互換のプレビュー

```bash
npm run preview
```

## デプロイ

```bash
npm run deploy
```

## ルーティング

- `/:slug` でプロフィールを表示します
- 存在しない `slug` は 404 を表示します

## スタブデータ

スタブデータは `app/data/profiles.ts` にあります。後で KV/D1 に置き換えられるように、取得処理を分離しています。
