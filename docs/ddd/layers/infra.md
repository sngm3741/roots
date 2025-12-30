# Infra Layer 方針

このドキュメントは Project Roots における  
**infra レイヤー（インフラストラクチャ層）** のルールを定義する。

対象は主に `backend/infra/` 配下のコード：

- DB 永続化（Repository 実装）: `infra/persistence/**`
- キャッシュ（Redis 等）: `infra/cache/**`
- 外部APIクライアント（LINE, メール, 決済 など）: `infra/external/**`
- ストレージ（R2/S3 等）: `infra/storage/**`
- クロック、ID生成などの技術的サービス

> ここでの「infra」は **DDD の infra layer** を指し、  
> Docker や VPS などの運用面の「インフラ」は別ドキュメントで扱う。

---

## 1. 役割と依存関係

### 1.1 役割

Infra Layer のゴールは：

- **技術的詳細（DB, キャッシュ, 外部API, ストレージ）を標準化し、隠蔽すること**
- domain/usecase が **純粋なビジネスルールのみに集中できるようにすること**
- Adapter/Usecase に「どの実装を使っているか」を意識させないこと

つまり：

- **「技術の世界」と「ドメインの世界」の境界を提供する層**

### 1.2 依存方向

- infra → domain には依存してよい（Repository interface, VO, Entity を知る）
- infra → usecase / adapter には依存しない
- domain / usecase / adapter → infra には **コンパイル依存しない**

実際の依存は「組み立て（composition）」フェーズで注入する：

- `cmd/api/main.go` などで
  - domain/usecase のインターフェース
  - infra の実装
  を紐づける。

---

## 2. ディレクトリ構成（例）

```txt
backend/
  domain/
  usecase/
  adapter/
  infra/
    persistence/
      pg/
        user_repository.go
        store_repository.go
        survey_repository.go
    cache/
      redis/
        client.go
    external/
      line/
        client.go
      mail/
        client.go
      payment/
        client.go
    storage/
      r2/
        client.go
      local/
        client.go
    time/
      clock.go
    id/
      generator.go
```

※ 実際のプロジェクト規模に応じてサブディレクトリは増減させてよいが、  
**責務ごと（persistence/cache/external/storage/time/id 等）に分ける** 方針とする。

---

## 3. Persistence（DB）実装

### 3.1 Repository 実装の置き場所

- Domain 側にあるのは **Repository interface** のみ：

```go
// domain/user/repository.go
package user

type Repository interface {
    Save(ctx context.Context, u *User) error
    FindByID(ctx context.Context, id ID) (*User, error)
}
```

- Infra 側に実装を置く：

```txt
infra/
  persistence/
    pg/
      user_repository.go
      store_repository.go
```

```go
// infra/persistence/pg/user_repository.go
package pg

type UserRepository struct {
    db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
    return &UserRepository{db: db}
}

func (r *UserRepository) Save(ctx context.Context, u *user.User) error {
    exec := getExecutor(ctx, r.db)
    // INSERT/UPDATE 実装
    return nil
}
```

### 3.2 責務

Infra の Repository 実装は次を担う：

- DB クエリの発行（SQL / ORM 等）
- DB row ↔ Entity/VO のマッピング
- DB 特有のエラー → domain エラーへの変換（`sql.ErrNoRows` → `user.ErrNotFound` 等）

逆に、次はやらない：

- ビジネスルールの満足度
- Usecase の分岐処理
- HTTP のステータス決定

トランザクションの扱いは `DDD/rules/data-access.md` に従う。

---

## 4. Cache（Redis 等）

### 4.1 位置づけ

キャッシュは DB と同じく **技術的最適化** であり、  
domain/usecase からは見えないようにする。

基本方針：

- domain に「キャッシュの存在」を一切漏らさない
- Repository 実装内部でキャッシュを使うかどうかを決める
- あるいは専用の Cache クライアントを usecase に注入する場合も、  
  interface は domain/usecase 側に定義し、実装は infra に置く

### 4.2 構成例

```txt
infra/
  cache/
    redis/
      client.go
```

```go
// infra/cache/redis/client.go
package redis

type Client struct {
    // ...
}
```

必要なら、domain/usecase 側にはインターフェースだけを定義してもよい：

```go
// usecase/port/cache.go
type Cache interface {
    Get(ctx context.Context, key string) (string, error)
    Set(ctx context.Context, key string, value string, ttl time.Duration) error
}
```

実装は `infra/cache/redis` に置く。

---

## 5. 外部APIクライアント（LINE, メール, 決済 等）

### 5.1 方針

外部APIとの連携は、次の依存関係を守る：

- domain/usecase 側には **「何をしたいか」のインターフェース** だけ定義する
  - 例：通知を送りたい → `Notifier` interface
  - 例：メールを送りたい → `Mailer` interface
  - 例：LINE メッセージを送りたい → `LineClient` interface（or `LineNotifier`）
- 具体的な HTTP Client や SDK の利用は **infra に閉じ込める**

### 5.2 構成例

```txt
domain/
  notification/
    service.go    // Notifier interface など
infra/
  external/
    line/
      client.go
    mail/
      client.go
    payment/
      client.go
```

domain or usecase 側：

```go
// domain/notification/service.go
package notification

type Notifier interface {
    NotifyUser(ctx context.Context, userID user.ID, msg Message) error
}
```

infra 側：

```go
// infra/external/line/client.go
package line

type Client struct {
    httpClient *http.Client
    // トークンなど
}

func (c *Client) NotifyUser(ctx context.Context, userID user.ID, msg notification.Message) error {
    // LINE API 呼び出し
    return nil
}
```

Usecase は `Notifier` interface を受け取り、  
具体的に LINE を使っていることは知らない。

---

## 6. Storage（R2/S3/ローカル）

### 6.1 方針

ファイル/オブジェクトストレージも同様に、  
domain/usecase 側にはインターフェースだけを見せる。

```txt
infra/
  storage/
    r2/
      client.go
    local/
      client.go
```

インターフェース例：

```go
// usecase/port/storage.go
type ObjectStorage interface {
    Put(ctx context.Context, key string, r io.Reader, opts PutOptions) error
    Get(ctx context.Context, key string) (io.ReadCloser, error)
    Delete(ctx context.Context, key string) error
}
```

実装は `infra/storage/r2` や `infra/storage/local` に置く。

Usecase からは `ObjectStorage` としか見えない。

---

## 7. クロック / ID生成 などの技術サービス

### 7.1 Clock（時間）

- Domain/Usecase から `time.Now()` を **直接叩かない** 方針にするなら、
  - `Clock` interface を定義して実装を infra に置く。

```go
// usecase/port/clock.go
type Clock interface {
    Now() time.Time
}
```

```go
// infra/time/clock.go
package timeinfra

type SystemClock struct{}

func (SystemClock) Now() time.Time {
    return time.Now()
}
```

- テストでは FakeClock を使える。

### 7.2 ID Generator

ID 生成にランダム/UUID/ULID を使う場合も同様。

```go
// usecase/port/id_generator.go
type IDGenerator interface {
    New() string
}
```

```go
// infra/id/generator.go
package idinfra

type ULIDGenerator struct{}

func (ULIDGenerator) New() string {
    // ULID 生成
}
```

Domain の ID 型は文字列ラッパー（VO）として定義し、  
Usecase で `idGen.New()` を呼んでから VO を生成する。

---

## 8. テスト方針（Infra）

### 8.1 Usecase / Domain テストとの分離

- Usecase/Domain のユニットテストでは、infra はモック or Fake に差し替える。
- Infra の実装（persistence, external）は **統合テスト寄り** になる。

### 8.2 Infra 実装のテスト

- 実 DB / テスト DB / テストコンテナを使ってクエリ検証
- テスト用ダミー外部APIサーバを立ててクライアントを検証
- `docker-compose` を用いたローカル統合テストも選択肢

Infra テストは「ビジネスロジック」ではなく  
「技術的な正しさ」（接続できるか、マッピングが正しいか）を担保する。

---

## 9. アンチパターン

Infra layer で避けるべきパターン：

- Infra から usecase/adapter を import する
- Infra の struct が domain の Entity/VO ではなく  
  `map[string]any` や `any` を返す
- Repository 実装がビジネスルールの判定を行っている
- domain/usecase が `infra/` パッケージを直接 import している
- time.Now() や rand.Seed() 等をあちこちから直叩きしてテスト不可能になっている
- 外部API SDK を domain から直接呼んでいる

これらを見つけたら、  
**domain/usecase/infra の責務分担を再検討する**。

---

## 10. 他ドキュメントとの関係

- DB・トランザクションの扱いの詳細は  
  → `DDD/rules/data-access.md`
- Repository interface の設計方針は  
  → `DDD/modeling/repository.md`
- Entity / VO / Aggregate / Domain Service の設計は  
  → `DDD/modeling/*.md`
- Adapter から infra をどう見せないか（= interface 経由で使う）  
  → `DDD/layers/adapter.md`, `DDD/layers/usecase.md`

Infra layer は、  
これらの「契約（interface, rules）」を満たす **実装の置き場** として徹底する。
