---
slug: 9c7f4c2b-0f4f-4b0a-9a2c-8b7f3e2d1a55
title: WEBリリース前チェックリスト
date: 2026-2-6
displayDate: Feb 6, 2026
author: @sngm3741
category: writing
summary: リリース直前に見落としがちな項目を、実務で使える形に整理。
tags: セキュリティ
---

リリース前の確認事項は、**「致命的な抜け漏れを防ぐ」**ための保険です。ここでは、
現場で効果が高かった項目を、**意味が伝わるように最短で**まとめています。

> ⚠️ このチェックリストは用途や業種で変わります。必要に応じて増補してください。

## 🔒 認証・Cookie

- `HttpOnly` が設定されているか（XSS耐性の基本）
- `SameSite` が適切か（Lax / Strict の選択を意図的に）
- `Secure` が有効か（HTTPSのみ送信）
- `Domain` を広げすぎていないか（サブドメイン漏洩のリスク）
- `__Host-` プレフィックスを使える場面は使う

**例: 安全なCookieの条件**

```http
Set-Cookie: __Host-session=...; Path=/; Secure; HttpOnly; SameSite=Lax
```



## 🔒 入力バリデーション

- **サーバー側**で必ず検証する（クライアントだけに依存しない）
- URL入力はスキームを制限する（`javascript:` などを拒否）
- 正規表現の抜け道（大小文字/エンコード/部分一致）を考慮
- ユーザー入力を `innerHTML` などで直接描画しない
- SQL/NoSQLインジェクションの防止策がある
- パス/ハンドルの予約語や不正形式を除外する



## 🔒 レスポンスヘッダー

- **HSTS** が有効（HTTPSの強制）
- `frame-ancestors` で埋め込みを制限（クリックジャッキング防止）
- `X-Content-Type-Options: nosniff` が有効



## 🔒 その他のセキュリティ

- 重要操作は再認証を要求する
- CDN / キャッシュが「動的レスポンス」を誤って保存していない
- オブジェクトストレージの公開設定を点検
- オープンリダイレクトを防ぐ（`redirect_to` の検証）
- CRUDの権限チェックが全てのルートで一貫している
- 例外/スタックトレースがユーザーに露出しない
- ファイルアップロードの**拡張子/サイズ/拡張子偽装**を防止



## 📧 メール配信

- 通知メールがスパム送信の踏み台にならない
- 重複送信を防げる（再試行の冪等性）
- SPF / DKIM / DMARC を設定
- 解除リンク（One-Click Unsubscribe）がある



## 📈 SEO

- `<title>` がページごとに適切
- canonical が正しく設定されている
- エラーページは 4xx / 5xx で返す
- 検索結果ページは `noindex` か canonical 対応
- robots.txt / sitemap が整備されている
- 重要ページに meta description を設定



## 🟦 Open Graph

- og:title / og:description / og:image / og:url
- `twitter:card` の種類が意図に合っている



## 💰 決済

- 決済成功とDB更新が不整合になっていない
- 二重請求を防ぐ仕組みがある
- 解約フローが単純で明確
- 領収書/請求書にアクセスできる



## ❤️ アクセシビリティ

- A11Yチェックに沿ったラベル/コントラスト/フォーカス



## 🚀 パフォーマンス

- 画像サイズ最適化（`srcset` / WebP / AVIF）
- 重要CSS/JSの最適化
- 画像やカードの**レイアウトシフト防止**
- DBインデックスが最低限入っている



## 💻 マルチデバイス

- スマホ/タブレットの崩れがない
- OS間でフォントが破綻していない
- スクロールバーの有無でレイアウトが変わらない



## 💡 その他

- 利用規約 / プライバシーポリシー
- 監視・アラートが最低限入っている
- favicon / apple-touch-icon



## 参考リンク
- MDN: Cookie Prefixes / `__Host-`  
  https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie
- OWASP: SQL Injection Prevention Cheat Sheet  
  https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html
- Google Search Central: robots / meta description  
  https://developers.google.com/search/docs/crawling-indexing/special-tags
