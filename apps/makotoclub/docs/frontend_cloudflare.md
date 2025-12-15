# makotoclub frontend — Cloudflare Pages/Functions デプロイ手順

このフロントエンドは React Router v7 (Remix系) を Cloudflare Pages + Functions で SSR 動作させる構成に切り替えた。

## 構成のポイント

- ビルド: `react-router build`（出力 `build/client` + `build/server` を Cloudflare Pages + Functions で配信）
- Functions エントリ: `functions/[[path]].ts` で `createPagesFunctionHandler` を呼び出し、`build/server/index.js` をハンドラに渡す
- 設定: `wrangler.toml` に `pages_build_output_dir`, `compatibility_date`, `nodejs_compat` フラグを設定
- スクリプト: `npm run dev`（通常開発）、`npm run preview`（本番ビルド後に Pages dev で確認）、`npm run deploy`（本番ビルド + Pages へのデプロイ）
- サーバエントリ: `app/entry.server.tsx` を Cloudflare（Web Streams）向けに上書きし、`renderToReadableStream` で SSR

## 前提

- Node.js 18+ / npm
- Cloudflare アカウントと Pages プロジェクト（`wrangler login` で認証）

## 手順

1. 依存取得: `npm install`
2. 開発: `npm run dev`
3. 本番ビルド + ローカル確認: `npm run preview`
   - `build/` を生成し、`wrangler pages dev ./build/client --inspector-port=0` で Cloudflare 互換の環境を起動する（`functions/` は自動認識されるためフラグ不要）。wrangler の認証ファイルは各自の `~/.wrangler` を利用する。
4. デプロイ: `npm run deploy`
   - `wrangler pages deploy ./build/client`（同じく functions ディレクトリは自動認識）

## 環境変数の扱い

- Cloudflare Pages のダッシュボードまたは `wrangler secret put KEY` で設定する
- loader/action では `context.cloudflare.env.KEY` で参照できる（`functions/[[path]].ts` で `getLoadContext` を渡している）。domain/usecase で直接 env を読むのは禁止。

## その他メモ

- 旧来の Node サーバ用の `react-router-serve` は使わない前提
- `compatibility_flags = ["nodejs_compat"]` を付けているので、Node API 依存がある場合も Workers 上で動作しやすい
- デプロイ前に `npm run typecheck` で型生成 + TS チェックを走らせると安全

## ローカルD1シード（モックデータ）

- D1 スキーマ: `apps/makotoclub/frontend/functions/db/schema.sql`
- サンプルデータ: `apps/makotoclub/frontend/functions/db/seed.sql`
- ローカルに投入する場合:

```bash
cd apps/makotoclub/frontend
npx wrangler d1 execute makotoclub --local --file ./functions/db/seed.sql
```

Pages dev の時は `--d1 DB=makotoclub` を指定し、ブラウザで一覧にデータが見えることを確認する。
