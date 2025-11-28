# Usecase Layer（Application Service）方針

このドキュメントは Project Roots における  
**usecase レイヤー（アプリケーションサービス層）** のルールを定義する。

Roots では名前としては `usecase` を使うが、  
**役割としては「Application Service」とみなす**。

---

## 1. 位置づけとゴール

### 1.1 Usecase = Application Service

Roots では次のように用語を整理する：

- **Usecase**
  - ディレクトリ/パッケージ名：`usecase`
  - 構造：`CreateUser`, `UpdateStore` など 1ユースケース = 1 struct
  - 責務：アプリケーションのユースケースを実行するサービス
- **Application Service**
  - 書籍/一般DDD用語上の名前
  - Roots では **Usecase と同義** と見なす

別に `application` ディレクトリや `ApplicationService` という別概念は作らない。

### 1.2 Usecase レイヤーの役割

- ユースケースごとの**アプリケーションルールの中心**
- domain（Entity/VO/Domain Service）・infra（Repository 実装等）を **オーケストレーション** する
- トランザクション境界を指定する（TxManager を使う）
- adapter（HTTP/gRPC 等）から呼び出される「入り口」

---

## 2. ディレクトリ構成

```txt
backend/
  usecase/
    user/
      create_user.go
      update_user.go
      get_user.go
    store/
      create_store.go
      update_store.go
    survey/
      create_survey.go
      answer_survey.go
```

---

## 3. 依存関係ルール

- usecase → domain のみ依存可
- usecase → adapter 禁止
- usecase → infra の具体実装は禁止（TxManager など抽象はOK）

---

## 4. 責務

- Repository から Aggregate を取得
- Entity/VO/Domain Service のメソッドを呼んでユースケース実行
- トランザクション制御
- Output DTO の作成

---

## 5. トランザクション

TxManager の `WithinTx` を利用する。

---

## 6. エラー方針

- Domain が返すエラーをそのまま返す
- HTTP などの判定は adapter で行う

---

## 7. テスト

- Repository / TxManager をモックしてよい
- 純粋にユースケースの分岐を検証する

---

## 8. 用語の整理

- **Usecase = Application Service**
- Roots では `Usecase` を正式名称とする
