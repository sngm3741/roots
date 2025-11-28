# Entity モデリング方針

このドキュメントは、Project Roots のバックエンド（Go）における  
**Entity の設計・実装ルール** を定義する。

対象は主に `backend/domain/<aggregate>/entity.go` に配置される型。

---

## 1. Entity とは何か（Rootsでの定義）

Roots における Entity は、次の条件を満たすドメインオブジェクトとする：

- **同一性（ID）で識別される**
- **状態（フィールド）と振る舞い（メソッド）をセットで持つ**
- **不変条件（invariant）を自分自身の中で守る責任がある**
- **外部技術（DB/HTTP/JSON等）を一切知らない**

逆に言うと、「ただの struct + getter/setter」や、「DB行のラッパー」は Entity ではない。

---

## 2. ファイル/パッケージ配置ルール

### 2.1 パッケージ単位

- 各集約ごとに `domain/<aggregate>` をパッケージとする：

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

- パッケージ名は **集約名（単数形の英語）**：

  - `domain/user` → `package user`
  - `domain/store` → `package store`

### 2.2 ファイル名

- 基本は `entity.go` に Entity の定義を置く。
- VO については、別ファイル `vo_*.go` 側に定義する（domain/<aggregate>/vo_*.go）。
- Entity 自体を分割したい場合のみ：

  - `entity_user.go`
  - `entity_profile.go`

など、**`entity_*.go` で用途が分かるように分割**してよい。

---

## 3. ID と同一性

### 3.1 ID 型の定義

- 各 Entity は **専用の ID 型** を持つ。

```go
package user

type ID string
```

- 文字列固定でよい（UUID/ULIDなどの生成方法は infra/usecase 側で扱う）。
- 他のドメインと混ざらないよう、**primitive のまま使うのではなく型で包む**。

### 3.2 ID の生成責務

- **ID の生成は Entity の責務ではない**（DB か usecase 側が行う）。
- パターン：

  ```go
  // usecase 側（例）
  id := user.ID(generateID())    // generateID は infra or 共通ユーティリティ
  u, err := user.New(id, name, email)
  ```

- Entity 側は「ID が空でないことをチェック」まではやってもよいが、  
  UUID 生成などの技術的詳細は持たない。

---

## 4. コンストラクタと不変条件

### 4.1 New関数で不変条件を守る

- Entity の new は **必ずコンストラクタ関数を経由する**：

```go
func New(id ID, name Name, email Email) (*User, error) {
    if id == "" {
        return nil, ErrInvalidID
    }
    if err := name.Validate(); err != nil {
        return nil, err
    }
    if err := email.Validate(); err != nil {
        return nil, err
    }

    return &User{
        id:    id,
        name:  name,
        email: email,
    }, nil
}
```

- 直接 struct リテラルで生成することは禁止：

  ```go
  // NG
  u := &User{ID: "xxx", Name: "太一"}
  ```

### 4.2 public field を避ける

- Entity のフィールドは基本的に **非公開フィールド（小文字）** とする：

```go
type User struct {
    id    ID
    name  Name
    email Email
}
```

- どうしても公開したい場合は VO 側で公開し、Entity 自体は閉じる。

### 4.3 不変条件の例

- `Name` は空文字禁止
- `Age` は 0 以上
- `Status` は定義済みの enum のいずれか
- `DeletedAt` と `IsDeleted` の整合性 など

不変条件を **usecase や handler ではなく Entity / VO 側で守る**。

---

## 5. Getter / Setter 方針

### 5.1 Getter

- 必要に応じて Getter（または同等のメソッド）を定義する：

```go
func (u *User) ID() ID {
    return u.id
}

func (u *User) Name() Name {
    return u.name
}

func (u *User) Email() Email {
    return u.email
}
```

- ただし「名前の変更」などの状態変化は、**意図のあるメソッドで表現**する。

### 5.2 Setter は使わない

- 汎用的な `SetName`, `SetEmail` のような Setter は禁止。

```go
// NG
func (u *User) SetName(name Name) {
    u.name = name
}
```

- 代わりに意味のある操作としてメソッド化する：

```go
// OK
func (u *User) Rename(to Name) error {
    if err := to.Validate(); err != nil {
        return err
    }
    u.name = to
    return nil
}
```

---

## 6. 集約と関連（Association）

### 6.1 他集約の Entity を直接持たない

- 原則として、他の集約の Entity を **直接フィールドに持たない**。

```go
// NG
type Store struct {
    Owner *user.User
}
```

- ID や VO を通じて「関連」を表現する：

```go
// OK
type Store struct {
    id      ID
    ownerID user.ID
}
```

### 6.2 双方向依存の禁止

- `user` と `store` が互いに import し合うような状態は禁止。

- もし双方向依存をしたくなったら：

  - どちらかを cross-reference にしない設計に変える
  - 関連情報の取得は usecase 側の責務にする

---

## 7. タイムスタンプ / Soft Delete

### 7.1 CreatedAt / UpdatedAt

- タイムスタンプは必要に応じて持ってよいが、  
  **domain では time.Time をそのまま使い、DB固有型は使わない**。

```go
type User struct {
    id        ID
    name      Name
    email     Email
    createdAt time.Time
    updatedAt time.Time
}
```

- 値のセットは usecase/infra から渡してもよいし、  
  `New` 内で `time.Now()` を呼んでもよい（ここは運用ポリシーで決める）。

  - テストでの制御を重視するなら「時刻は外から渡す」を選ぶ。

### 7.2 Soft Delete

- Soft Delete を採用する場合、フィールド設計は例：

```go
type User struct {
    // ...
    deletedAt *time.Time
}
```

- 削除操作は専用メソッドで行う：

```go
func (u *User) Delete(now time.Time) {
    u.deletedAt = &now
}
```

- `IsDeleted` 判定用のメソッドを用意する：

```go
func (u *User) IsDeleted() bool {
    return u.deletedAt != nil
}
```

---

## 8. DB / JSON とのマッピング方針

### 8.1 Entity にはタグを付けない

- Entity struct に `json` / `db` / `gorm` 等のタグを付けるのは禁止。

```go
// NG
type User struct {
    ID    string `json:"id" db:"id"`
    Name  string `json:"name" db:"name"`
}
```

- これは DB / API との境界情報なので、  
  **adapter（DTO）か infra（ORM model）に閉じ込める**。

### 8.2 DTO / ORM モデルとの変換

- HTTP 用の DTO、DB 用のモデルは別 struct で定義し、  
  変換は以下のどこかで行う：

  - adapter 層：HTTP DTO ↔ usecase DTO
  - infra 層：DB 行 ↔ Entity

---

## 9. テスト方針（Entity）

### 9.1 Entity テストの目的

- Entity のテストは **ビジネスルールと不変条件が守られているか** を検証する。

### 9.2 テストの特徴

- DB や外部APIには一切触れない。
- モックも基本的には不要。
- 単体テストとして完結する。

---

## 10. エラーモデル

### 10.1 ドメインエラーの定義

- ビジネスルール違反を表すエラーは、Entity/VO のパッケージ内で定義する。

---

## 11. Entity をどう分割するか

### 11.1 単一 Entity vs 複数 Entity

- ライフサイクルや不変条件が異なる場合は別 Entity に切る。

### 11.2 集約ルート

- Roots v1 では、集約ルートを明示的に区別するため、  
  外部から直接参照される Entity を集約ルートとみなす。

---

## 12. アンチパターン（見つけたら即修正）

- public field だらけ
- struct リテラルで生成
- domain が DB 型や JSON タグと結合
- Setterだらけの貧血モデル

---

## 13. 今後の拡張（TODO）

- ドメインイベントの扱い
- 権限モデルの分割方針
