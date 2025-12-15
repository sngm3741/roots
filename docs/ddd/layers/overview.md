# Layers Overview

Project Roots のバックエンドは、Clean Architecture（Ports & Adapters系）をベースに次の 4 レイヤーで構成する。

- `domain`  : ドメインモデル（エンティティ / VO / ドメインサービス / リポジトリIF）
- `usecase` : アプリケーションルール（ユースケース / アプリケーションサービス）
- `adapter` : 外部との境界（HTTP, gRPC, CLI, Webhook など）
- `infra`   : 技術的詳細（DB, 外部API, メール送信, ストレージ など）

---

## 1. ディレクトリ構成（例）

```
backend/
  domain/
    user/
    store/
    survey/
  usecase/
    user/
    store/
  adapter/
    http/
    grpc/
  infra/
    persistence/
    external/
```

---

## 2. 依存方向ルール（Dependency Rule）

- `domain` → 他レイヤーに依存しない
- `usecase` → `domain` のみに依存可
- `adapter` → `usecase`/`domain` に依存可（infra へ依存禁止）
- `infra` → `domain` のみに依存可（usecase/adapter へ依存禁止）

### 禁止例
- infra から usecase を import する
- adapter が DB クライアントを直接 new して叩く
- domain が HTTP や DB の型を参照する

---

## 3. レイヤーごとの責務（概要）

### domain
- ビジネスルール中心、外部技術に依存しない。

### usecase
- ユースケース単位の処理、複数リポジトリのオーケストレーション。

### adapter
- 外界との I/O、リクエスト/レスポンスの変換、HTTP/gRPC/CLI/Webhook。

### infra
- DB・外部APIなどの技術詳細、Repository IF の実装。

---

## 4. 新規コード配置ガイド

- ビジネスルール → domain
- アプリの流れ → usecase
- 入出力変換 → adapter
- 技術（DB/API） → infra
