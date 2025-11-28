# DDD Docs Index（Project Roots）

このディレクトリは、Project Roots における  
**バックエンド DDD + Clean Architecture のルールブック** である。

- 何をどのレイヤーに置くか
- ドメインモデルをどう設計するか
- DB や Tx をどう扱うか

をすべてここで定義する。  
**「迷ったらここを読む」** のが前提。

---

## 1. 構成概要

```txt
DDD/
  index.md          ← このファイル
  layers/           ← レイヤー構造・依存ルール
  modeling/         ← ドメインモデルの作り方
  rules/            ← 補助的な技術ルール（主に Data Access）
```

- **layers/**  
  → domain / usecase / adapter / infra の役割と依存方向

- **modeling/**  
  → Entity / VO / Aggregate / Domain Service / Repository のモデリングルール

- **rules/**  
  → Tx / DB 接続 等、DDD を実装するための技術ルール

---

## 2. 各ディレクトリの中身

### 2.1 layers/（レイヤー構造）

レイヤーごとの責務と依存方向を定義する。

- `layers/overview.md`  
  → 全体像（4レイヤーの関係）

- `layers/domain.md`  
  → Domain Layer（ビジネスルール・ユビキタス言語）の責務  
  → modeling/ へのリンクを含む

- `layers/usecase.md`  
  → Usecase Layer（Application Service）の責務  
  → TxManager をどこで使うか、Repository との関係

- `layers/adapter.md`  
  → Adapter Layer（HTTP/gRPC/CLI/Webhook）の責務  
  → DTO の扱い、エラーマッピング、認証/認可の位置づけ

- `layers/infra.md`  
  → Infra Layer（DB・外部API・ストレージ等）の責務  
  → Repository 実装、外部クライアント、Clock/IDGenerator の扱い

> **目的：**  
> コードの「置き場所」と「依存方向」で迷わないようにする。

---

### 2.2 modeling/（ドメインモデルの作り方）

ドメインモデルの中身（Entity/VO/Aggregate 等）のルールを定義する。

- `modeling/entity.md`  
  → Entity の定義、ID、状態遷移メソッド、不変条件の持たせ方

- `modeling/value-object.md`  
  → VO の定義、不変・等価性、VO ファイル命名（`vo_*.go`）方針

- `modeling/aggregate.md`  
  → Aggregate の境界、不変条件（invariant）、集約間参照ルール

- `modeling/domain-service.md`  
  → Domain Service を使ってよい条件/ダメな条件、責務と配置場所

- `modeling/repository.md`  
  → Repository interface の設計ルール、Command/Query 分離の前提

> **目的：**  
> 「ドメインモデルがバラバラなスタイルになる」ことを防ぎ、  
> どの集約も同じ思想で実装できるようにする。

---

### 2.3 rules/（技術ルール）

現在は主に Data Access / Tx のルールを定義する。

- `rules/data-access.md`  
  → TxManager の設計  
  → context に Tx/DB を載せる方法  
  → Repository が Tx を開始しないルール  
  → Command Repository / Query Repository の分離方針

> **目的：**  
> DDD のレイヤー構造を実際の DB/Tx でどう守るかを明文化する。

将来的に追加候補：

- `rules/error-handling.md`（エラー設計の詳細）
- `rules/eventing.md`（Domain Event / Integration Event 方針）

---

## 3. やりたいこと別「どこを読むか」ガイド

### 3.1 新しいユースケースを追加したいとき

1. `layers/usecase.md`  
   → Usecase の責務 / 依存ルールを確認
2. `modeling/entity.md`, `modeling/value-object.md`  
   → 必要なら Entity/VO の設計を確認
3. `modeling/repository.md`  
   → Repository にどの finder を追加すべきか確認
4. `rules/data-access.md`  
   → TxManager の使い方を確認

### 3.2 新しい Aggregate / 集約を追加したいとき

1. `modeling/aggregate.md`  
   → 境界・不変条件の考え方を確認
2. `modeling/entity.md`, `modeling/value-object.md`  
   → 集約内の Entity/VO の設計ルール
3. `modeling/repository.md`  
   → Repository interface の設計（Save/Find の形）

### 3.3 新しい HTTP API を追加したいとき

1. `layers/adapter.md`  
   → Handler 構造、DTOの位置づけ、エラーマッピング
2. `layers/usecase.md`  
   → Usecase の作り方
3. `layers/domain.md`, `modeling/*`  
   → 必要なら Domain 側のモデル変更

### 3.4 新しい DB テーブル / 外部API を扱いたいとき

1. `layers/infra.md`  
   → infra に何を置くか、外部APIクライアントの置き場所
2. `modeling/repository.md`  
   → Repository interface にどう反映するか
3. `rules/data-access.md`  
   → Tx / DB アクセスのルール

---

## 4. LLM（Codex/ChatGPT）に読み込ませるときの想定

Roots では、LLM を「設計アシスタント」として使う前提のため、  
**この DDD ディレクトリは LLM に都度読み込ませる前提で書いてある。**

LLM にコンテキストとして渡す優先順：

1. `DDD/index.md`（このファイル）
2. `DDD/layers/overview.md`
3. 必要なレイヤーの詳細（`layers/usecase.md`, `layers/domain.md`, など）
4. 対象に応じた modeling ドキュメント（Entity/VO/Aggregate/Repository）
5. DB/Tx を扱う場合は `rules/data-access.md`

> 例：  
> 「User の新しいユースケースを実装して」と LLM に依頼するときは、  
> 上記のセットを一緒に投げる。

---

## 5. スコープの明確化

この DDD ディレクトリは：

- バックエンドコードの **設計・構造・モデリングルール** のみを扱う。
- アプリケーションランタイム（Auth/Logging/Metrics 等）は別ドキュメントで扱う。
- インフラ運用（Docker/VPS/ネットワーク/R2 等）も別ドキュメントで扱う。

将来的に、例えば次のように整理する想定：

```txt
docs/
  ARCHITECTURE.md       ← 全体のトップ
  DDD/                  ← 今ここ
  APP/                  ← ランタイム・エラー・認証/認可など
  INFRA/                ← VPS, ネットワーク, 監視, デプロイなど
```

---

## 6. 最後に

- **コードを書く前に DDD を読む**  
- **迷ったときに DDD に戻ってくる**

この循環を作るためのディレクトリが `docs/ddd/`。

新しい知見や失敗が出たら、  
**コードではなくまずこのルールブックを更新する** ことを徹底する。
