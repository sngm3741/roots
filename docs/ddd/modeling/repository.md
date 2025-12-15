# Repository モデリング方針

このドキュメントは Project Roots における  
**Repository（リポジトリ）の設計・実装ルール** を定義する。

対象は主に：

- `backend/domain/<aggregate>/repository.go` （Repository interface）
- `backend/infra/persistence/<db>/<aggregate>_repository.go` など（実装）

---

## 1. Repository の役割（Roots の定義）

Roots における Repository は、DDD の定義に基づき：

- **Aggregate Root を永続化・取得するための抽象**
- **ドメインモデルを永続化技術（DB 等）から切り離すための境界**
- **usecase が「Aggregate をどう取るか・保存するか」を意識せずに済むための窓口**

とする。

逆に、次のようなものは Repository ではない：

- 生 SQL をそのまま叩くヘルパー
- 画面専用の複雑な JOIN ビュー（Read Model）
- 外部API呼び出しのクライアント（それは Client/Service）

---

## 2. 物理構造と命名ルール

### 2.1 Domain 側（インターフェース）

1 集約 = 1 Repository interface とし、  
`domain/<aggregate>/repository.go` に定義する。

```txt
domain/
  user/
    entity.go
    vo_name.go
    vo_email.go
    repository.go    // ← ここに interface
  store/
    entity.go
    repository.go
  survey/
    entity.go
    repository.go
```

#### インターフェース名

- **常に `Repository`** とする。
- パッケージ名で区別する：

```go
// domain/user/repository.go
package user

type Repository interface {
    Save(ctx context.Context, u *User) error
    FindByID(ctx context.Context, id ID) (*User, error)
}
```

```go
// domain/store/repository.go
package store

type Repository interface {
    Save(ctx context.Context, s *Store) error
    FindByID(ctx context.Context, id ID) (*Store, error)
}
```

### 2.2 Infra 側（実装）

DB ごとにサブディレクトリを切る：

```txt
infra/
  persistence/
    pg/
      user_repository.go
      store_repository.go
      survey_repository.go
    mongo/
      ...
```

- ファイル名：`<aggregate>_repository.go`
  - `user_repository.go`
  - `store_repository.go`
- パッケージ名：`package pg` / `package mongo` など

実装 struct の命名例：

```go
type UserRepository struct {
    db *sql.DB
}

type StoreRepository struct {
    db *sql.DB
}
```

---

## 3. Repository interface の設計ルール

### 3.1 Aggregate Root 単位

Repository interface は **Aggregate Root 単位** で定義する。

- `User` 集約 → `user.Repository`
- `Store` 集約 → `store.Repository`

サブ Entity 専用の Repository は基本作らない。

### 3.2 メソッド設計（基本セット）

最低限のパターン：

```go
type Repository interface {
    Save(ctx context.Context, u *User) error
    FindByID(ctx context.Context, id ID) (*User, error)
}
```

必要に応じて：

- `FindByIDs`
- `FindByEmail` など、**ユースケースで本当に必要なものだけ** を追加する。

### 3.3 「なんでも屋」Repository を作らない

NG 例：

```go
type Repository interface {
    Save(ctx context.Context, u *User) error
    FindByID(ctx context.Context, id ID) (*User, error)
    FindAll(ctx context.Context) ([]*User, error)
    FindByCondition(ctx context.Context, cond map[string]interface{}) ([]*User, error)
    UpdatePartially(ctx context.Context, fields map[string]interface{}) error
    // ...
}
```

- こういった「クエリビルダ的なんでも屋」は禁止。
- 複雑な検索・画面専用ビューは **Read Model / Query Repository** で別扱いにする（v1では後回しにしてもよい）。

---

## 4. Command / Query の分離方針（v1）

### 4.1 v1 の割り切り

Roots v1 では：

- Domain Repository（`domain/*/Repository`）は **基本的な CRUD + ユースケースに必要な少数の finder** に絞る。
- 画面専用・集計系などの複雑なクエリは、必要になった時点で：
  - 専用の **Query Repository**（読み取り専用）を `infra` に定義
  - or usecase 直下で DTO を返すための専用ロジックを作成

Repository interface を **複雑な検索APIの集合体** にしない。

---

## 5. エラー設計

### 5.1 NotFound

「存在しない」は domain 側でエラーとして定義し、  
Infra 実装は DB の結果をそれにマッピングする。

```go
// domain/user/errors.go
var ErrNotFound = errors.New("user: not found")
```

```go
// infra/persistence/pg/user_repository.go
func (r *UserRepository) FindByID(ctx context.Context, id user.ID) (*user.User, error) {
    // row := ...
    // if sql.ErrNoRows → user.ErrNotFound に変換
}
```

### 5.2 その他エラー

- DBエラーなど技術的なエラーはそのまま wrap して返してよい。
- adapter/usecase が `errors.Is(err, user.ErrNotFound)` のように  
  ビジネス的なエラーと技術エラーを判別する。

---

## 6. トランザクションとの関係

### 6.1 Repository 自体はトランザクションを開始しない

- トランザクション開始/終了の責務は **Usecase + TxManager** に置く。
- Repository は「渡された `ctx` に紐づくコネクション」を使うイメージ。

```go
// usecase 内
err := uc.tx.WithinTx(ctx, func(txCtx context.Context) error {
    u, err := uc.userRepo.FindByID(txCtx, in.UserID)
    if err != nil {
        return err
    }
    // ...
    if err := uc.userRepo.Save(txCtx, u); err != nil {
        return err
    }
    return nil
})
```

### 6.2 接続の扱い（実装側の方針）

- `TxManager` が内部で `*sql.Tx` を管理し、`context.Context` に紐づける形を想定。
- Repository 実装は `ctx` から「現在の Tx or DB」を取得してクエリを実行する。

詳細は `DDD/rules/data-access.md` 側で定義するが、  
Repository のインターフェースレベルでは **ctx だけ受け取ればよい**。

---

## 7. DTO / Entity 変換の責務

- Repository は「DB Row ↔ Entity/VO」の変換を担当する。
- adapter（HTTP）には Entity を直接返さず、usecase が DTO を組み立てる。

イメージ：

```go
// infra/persistence/pg/user_repository.go
func (r *UserRepository) FindByID(ctx context.Context, id user.ID) (*user.User, error) {
    // SQL 実行 → row struct
    // row から Entity/VO を組み立て
    return u, nil
}
```

```go
// usecase/user/get_user.go
out := &GetUserOutput{
    ID:    string(u.ID()),
    Name:  string(u.Name()),
    Email: string(u.Email()),
}
```

---

## 8. テスト方針

### 8.1 Usecase テスト

- Repository interface をモック化し、usecase の分岐ロジックをテストする。
- 目的：
  - 正しい条件で Repository が呼ばれるか
  - エラー時のハンドリングが期待通りか

### 8.2 Repository 実装のテスト

- `infra/persistence/*` 側は **DB実機 or テストDB** を使った統合テストに近いスタイルになる。
- 目的：
  - SQLが正しいか
  - マッピング（row → Entity/VO）が壊れていないか
  - トランザクション境界で期待通りの挙動か

---

## 9. アンチパターン

- Repository interface に行数・ページング・条件式などを詰め込みすぎる
- Repository が `context.Background()` を勝手に作って使う
- Repository がトランザクションを勝手に開始・コミットする
- Repository が HTTP / gRPC / メッセージングを直接呼び出す
- Entity/VO ではなく、`map[string]interface{}` や `any` を返してくる

これらを見かけたら、**Domain / Usecase / Infra の責務分担の崩れ** を疑う。

---

## 10. 今後の拡張（TODO）

- Query Repository / Read Model の具体ルール
- 複数 DB（書き込みと読み取りの分離など）を導入した場合の設計
- キャッシュ戦略（Repository レベルでやるか、別レイヤーでやるか）
