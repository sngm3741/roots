# Domain Service モデリング方針

Domain Service は **複数 Entity/VO にまたがる純ドメインロジック** を表現するための仕組み。

---

## 1. 定義

- 複数オブジェクトに跨るビジネスルール
- 技術的詳細に依存しない
- ステートレス
- domain 配下に置く

---

## 2. 置き場所

```txt
domain/user/
  entity.go
  vo_*.go
  repository.go
  service_*.go
```

ファイル名：`service_*.go`

---

## 3. 使ってよい条件

- 複数 Entity / VO を横断する
- Entity に押し込むのが不自然
- 複数ユースケースで繰り返し必要
- 概念として名前を与えたい

## 使ってはいけない条件

- 単一 Entity で完結するルール
- VO単体の検証
- Repository や外部APIが必要なロジック

---

## 4. API デザイン

### パターンA：pure function

```go
func ValidatePasswordPolicy(pw Password) error
```

### パターンB：小さな struct

```go
type PasswordPolicyService struct { ... }
```

v1では A を優先。

---

## 5. 依存関係

- Entity/VO は OK
- Repository / infra / adapter は NG

---

## 6. Usecase との分担

- Usecase：フロー操作・Repository操作
- Domain Service：純粋なビジネスルール

---

## 7. テスト

- DB不要の純粋ユニットテストでOK

---

## 8. アンチパターン

- Repository を触る
- Usecase 丸ごと移植
- God Domain Service

