# Value Object モデリング方針

このドキュメントは Project Roots における  
**Value Object（VO）の設計・実装ルール** を定義する。

VO は Entity と並んでドメインモデルの基盤であり、  
ビジネスルールの中心となる型。

対象は主に `backend/domain/<aggregate>/vo_*.go` に配置される型とし、
VO は必ず `vo_*.go` というファイル名で切り出す。

---

## 1. Value Object とは（Roots の定義）

Roots における Value Object は、次の条件を満たすドメインオブジェクトとする：

- **同一性（ID）ではなく「値」で等価性が決まる**
- **不変である（immutable）**
- **ビジネスルール（検証・制約）を内包する**
- **外部技術（DB / HTTP / JSON 等）を一切知らない**
- **主に Entity の属性として利用される**

逆に言うと、単なる

- `string` / `int` 等をそのまま使っただけの値
- ただの struct 入れ物（バリデーションなし）
- DB / JSON タグだらけの構造体

は VO ではない。

---

## 2. パッケージ構成とファイル配置

### 2.1 VO は集約ごとに配置し、常に `vo_*.go` に分割する

VO は **集約ごとに** パッケージ内にまとめるが、  
最初の1個目から必ず `vo_*.go` というファイル名で切る。

```txt
domain/
  user/
    entity.go
    vo_name.go
    vo_email.go
    repository.go
  store/
    entity.go
    vo_store.go
  survey/
    entity.go
    vo_survey.go
```

- 物理的なファイルは複数あっても、すべて同じパッケージ（例：`package user`）とする。
- パッケージ名は集約と同じ：`package user` / `package store`

### 2.2 「共通VOパッケージ」は作らない

NG 例：

```txt
domain/
  vo/
    email.go
    name.go
```

- 一見便利だが、**ユビキタス言語を壊す** ので禁止。
- `UserEmail` と `StoreEmail` が本当に同じ制約か？という問題が必ず出る。
- どうしても共通化したい場合は「実装をコピペ」するくらいでよい（ルールの共通基底は後回し）。

---

## 3. VO の基本形（プリミティブラッパー）

### 3.1 型 + コンストラクタ + Validate

VO の基本形は：

- 専用の型（多くは `string` / `int` のラッパー）
- `NewXxx` コンストラクタ
- `Validate` メソッド

で構成する。

```go
package user

import "errors"

var (
    ErrInvalidName  = errors.New("user: invalid name")
    ErrInvalidEmail = errors.New("user: invalid email")
)

type Name string

func NewName(v string) (Name, error) {
    n := Name(v)
    if err := n.Validate(); err != nil {
        return "", err
    }
    return n, nil
}

func (n Name) Validate() error {
    if len(n) == 0 {
        return ErrInvalidName
    }
    if len(n) > 100 {
        return ErrInvalidName
    }
    return nil
}

type Email string

func NewEmail(v string) (Email, error) {
    e := Email(v)
    if err := e.Validate(); err != nil {
        return "", err
    }
    return e, nil
}

func (e Email) Validate() error {
    if e == "" {
        return ErrInvalidEmail
    }
    // ここでフォーマットチェックするかは設計方針次第
    return nil
}
```

### 3.2 New を通さず値を作らない

NG：

```go
email := user.Email("test@example.com")   // 直接キャスト
```

OK：

```go
email, err := user.NewEmail("test@example.com")
if err != nil {
    // handle
}
```

VO を new した時点で不変条件が守られている状態にする。

---

## 4. 不変 & immutable

### 4.1 VO は「作ったら変えない」

VO は **immutable** を前提とする。

- フィールドを書き換えない
- setter を持たない
- 「更新したい場合は新しい VO を作る」

```go
// NG：書き換える前提の設計
type Name struct {
    value string
}

func (n *Name) Set(v string) {
    n.value = v
}
```

```go
// OK：immutable 前提
type Name string

func NewName(v string) (Name, error) {
    n := Name(v)
    if err := n.Validate(); err != nil {
        return "", err
    }
    return n, nil
}
```

VO の変更は「新しい VO を作成する」という形で表現する。

---

## 5. 等価性（Equality）

### 5.1 VO は値で等しいかどうかを見る

Entity は「ID が同じなら同一」とみなすが、  
VO は **値自体が同じなら等しい** とみなす。

Go のプリミティブラッパーであれば `==` で十分：

```go
func (e Email) Equals(other Email) bool {
    return e == other
}
```

Entity 側で VO を比較する場合も同様に `==` でよい。

---

## 6. VO と JSON / DB の関係

### 6.1 VO struct にタグは禁止

Entity と同様、VO にも `json` / `db` / `gorm` タグを付けない。

```go
// NG
type Email string `json:"email" db:"email"`
```

### 6.2 DTO / DB モデルと VO の変換

境界で変換する：

- adapter（HTTP）：
  - Request JSON → DTO struct → usecase input → VO 作成
  - usecase output → DTO struct → Response JSON
- infra（DB）：
  - row struct → VO / Entity に変換
  - VO / Entity → row struct に変換

例（adapter）：

```go
type createUserRequest struct {
    Email string `json:"email"`
    Name  string `json:"name"`
}

func (h *UserHandler) CreateUser(w http.ResponseWriter, r *http.Request) {
    var req createUserRequest
    // decode → usecase input に詰める
}
```

---

## 7. VO の種類別ガイドライン

### 7.1 プリミティブ VO

最も基本的なパターン：

- `Name` / `Email` / `Age` / `Price` / `Count` など

ルール：

- 直接 `string` や `int` を使わない
- **型で意味を表現する**

NG（raw string）：

```go
type User struct {
    name  string
    email string
}
```

OK（VO）：

```go
type User struct {
    name  Name
    email Email
}
```

### 7.2 Enum VO（状態・種別）

ステータスや種別は Enum 的な VO にする。

```go
type Status string

const (
    StatusActive   Status = "active"
    StatusDisabled Status = "disabled"
)

var ErrInvalidStatus = errors.New("user: invalid status")

func NewStatus(v string) (Status, error) {
    s := Status(v)
    if err := s.Validate(); err != nil {
        return "", err
    }
    return s, nil
}

func (s Status) Validate() error {
    switch s {
    case StatusActive, StatusDisabled:
        return nil
    default:
        return ErrInvalidStatus
    }
}
```

### 7.3 複合 VO

住所、期間、座標、レンジなどは struct でまとめた複合 VO にしてよい。

```go
type Address struct {
    Prefecture string
    City       string
    Street     string
}

var ErrInvalidAddress = errors.New("user: invalid address")

func NewAddress(pref, city, street string) (Address, error) {
    a := Address{
        Prefecture: pref,
        City:       city,
        Street:     street,
    }
    if err := a.Validate(); err != nil {
        return Address{}, err
    }
    return a, nil
}

func (a Address) Validate() error {
    if a.Prefecture == "" || a.City == "" {
        return ErrInvalidAddress
    }
    return nil
}
```

ポイント：

- フィールドは直接公開でもよいが、  
  「VO 全体として不変条件を保つ」責任は `Validate` が負う。

---

## 8. VO と Entity の責務境界

### 8.1 VO = 小さなルール

VO は**局所的な制約**を扱う：

- Email の形式
- 名前の長さ
- 金額が 0 以上
- 期間の from <= to

### 8.2 Entity = 大きなルール / 状態遷移

Entity は：

- 「ユーザー名変更にはこの条件が必要」
- 「この状態の注文はキャンセルできない」

など、**より大きなビジネスルール**を扱う。

VO に「ユースケース全体の判断」を乗せない。  
VO はあくまで「1つの概念の妥当性」を表現する。

---

## 9. テスト方針（VO）

### 9.1 目的

- VO のテストは **値の妥当性チェック** に特化する：

  - 不正な値 → エラーになる
  - 正常な値 → 常に生成できる
  - 境界値（長さ、範囲）で正しく動く

### 9.2 特徴

- DB や外部APIには一切触れない
- モックも不要
- テストケースは「値の組み合わせ」に集中する

例：

```go
func TestNewEmail_Invalid(t *testing.T) {
    _, err := user.NewEmail("")
    if err == nil {
        t.Fatal("expected error, got nil")
    }
}
```

---

## 10. エラー設計

### 10.1 VOごとのエラー

- VO ごとにエラーを定義するのではなく、  
  **集約単位のエラーにまとめてよい**：

```go
var (
    ErrInvalidEmail = errors.New("user: invalid email")
    ErrInvalidName  = errors.New("user: invalid name")
)
```

### 10.2 エラーメッセージは内部用

- エラーメッセージはログ/デバッグ用と割り切る。
- クライアント向け文言は adapter 層で組み立てる。

---

## 11. アンチパターン（見つけたら即リファクタ）

- VO を定義したのに、外側で string チェックしている
- VO に `json` / `db` / `gorm` タグが付いている
- VO がミュータブル（フィールドを書き換えまくっている）
- VO を `domain/vo` のような「共通パッケージ」にまとめている
- VO が infra / adapter の型（`sql.NullString`, `time.Time`のフォーマット等）を持ち込んでいる

---

## 12. サンプル：User 集約の VO セット

```go
// domain/user/vo.go
package user

import (
    "errors"
    "strings"
)

var (
    ErrInvalidName  = errors.New("user: invalid name")
    ErrInvalidEmail = errors.New("user: invalid email")
)

type Name string

func NewName(v string) (Name, error) {
    n := Name(v)
    if err := n.Validate(); err != nil {
        return "", err
    }
    return n, nil
}

func (n Name) Validate() error {
    if len(n) == 0 {
        return ErrInvalidName
    }
    if len(n) > 100 {
        return ErrInvalidName
    }
    return nil
}

type Email string

func NewEmail(v string) (Email, error) {
    e := Email(v)
    if err := e.Validate(); err != nil {
        return "", err
    }
    return e, nil
}

func (e Email) Validate() error {
    if e == "" {
        return ErrInvalidEmail
    }
    if !strings.Contains(string(e), "@") {
        return ErrInvalidEmail
    }
    return nil
}
```

---

## 13. 今後の拡張（TODO）

- 金額（Money）VO の扱い（通貨・小数・内部表現）
- 期間（DateRange）VO の扱い（タイムゾーン・境界含む/含まない）
- 集約を跨ぐ VO をどうしても定義したいケースの扱いルール
- VO と Domain Event の関係

まずは本ドキュメントのルールを守って実装し、  
実際の開発で違和感が出たときにここを更新していく。
