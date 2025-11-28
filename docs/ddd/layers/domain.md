# Domain Layer 方針

このドキュメントは Project Roots における  
**domain レイヤー（ドメイン層）** のルールを定義する。

対象は主に `backend/domain/<aggregate>/` 配下の：

- Entity（`entity.go`, `entity_*.go`）
- Value Object（`vo_*.go`）
- Repository interface（`repository.go`）
- Domain Service（`service_*.go` ※必要な場合のみ）

※ 各要素のモデリング詳細は `modeling/*.md` に分離している。

- Entity → `modeling/entity.md`
- Value Object → `modeling/value-object.md`
- Aggregate → `modeling/aggregate.md`
- Domain Service → `modeling/domain-service.md`
- Repository → `modeling/repository.md`

---

## 1. 役割とゴール

Domain Layer のゴール：

- ビジネスルールとユビキタス言語を **コードとして表現する場所** を提供する
- 外部技術（DB / HTTP / JSON / SDK 等）から完全に切り離す
- Entity / VO / Domain Service を通じて **不変条件を守る**

依存方向：

- domain は **他レイヤーに依存しない**
- usecase / adapter / infra が domain に依存する

---

## 2. ディレクトリ構成（Aggregate 単位）

```txt
domain/
  user/
    entity.go          // User 集約ルート
    entity_profile.go  // 必要なら分割
    vo_name.go
    vo_email.go
    repository.go
    // service_*.go （必要になったら追加）
  store/
    entity.go
    vo_store.go
    repository.go
  survey/
    entity.go
    vo_survey.go
    repository.go
```

- 1集約 = 1ディレクトリ
- ディレクトリ名 = パッケージ名 = 集約名（単数形）

Aggregate の切り方や責務については `modeling/aggregate.md` を参照。

---

## 3. Domain に置くもの

### 3.1 Entity

- 同一性（ID）で識別されるドメインオブジェクト
- 状態 + 振る舞いをセットで持つ
- 集約ルート / サブ Entity に分かれることがある
- 不変条件を内部で守る

詳細は `modeling/entity.md` を参照。

### 3.2 Value Object (VO)

- 値で等価性が決まるオブジェクト
- 不変であり、バリデーションを自分で持つ
- Entity の属性として利用される
- JSON/DBタグを持たない

詳細は `modeling/value-object.md` を参照。

### 3.3 Repository interface

- Aggregate Root を永続化・取得するための抽象
- `infra` レイヤーがこれを実装する

```go
// domain/user/repository.go
package user

type Repository interface {
    Save(ctx context.Context, u *User) error
    FindByID(ctx context.Context, id ID) (*User, error)
}
```

詳細は `modeling/repository.md` を参照。

### 3.4 Domain Service

Domain Service は：

- 複数 Entity / VO にまたがる **純粋なドメインロジック**
- DB / 外部API など技術的詳細には依存しない
- `service_*.go` に定義し、各集約パッケージ内に置く

詳細は `modeling/domain-service.md` を参照。

---

## 4. Domain に置かないもの

- DB 接続や SQL / ORM モデル
- HTTP リクエスト / レスポンス
- JSON タグやバリデーションタグ
- ロガー / 設定 / 環境変数 / トランザクション管理
- 外部API SDK の型や関数

これらは infra / adapter / usecase の責務。

---

## 5. エラー設計（概要）

- ビジネスルール違反は Domain 側でエラーとして定義する：

```go
var (
    ErrInvalidName  = errors.New("user: invalid name")
    ErrInvalidEmail = errors.New("user: invalid email")
    ErrNotFound     = errors.New("user: not found")
)
```

- adapter/usecase はこれらのエラーを見て振る舞いを変える（HTTPステータスなど）。
- エラーメッセージはログ/内向きと割り切り、  
  クライアント向け文言は adapter で決める。

詳細なエラーのグルーピング方針は、必要になった段階で別ドキュメント化してよい。

---

## 6. Domain Service と Specification について

### 6.1 Domain Service

- 採用する。ただし **乱発しない**。
- 詳細ルールは `modeling/domain-service.md` に完全定義する：

  - いつ Domain Service を使ってよいか
  - どこに置くか（`service_*.go`）
  - Entity / VO との責務分担
  - usecase / infra との依存関係

### 6.2 Specification パターン（v1 方針）

Specification パターンは設計コストが高く、  
Roots v1 では **標準採用しない** 方針とする。

- 複雑な条件はまず：
  - Entity / VO のメソッド
  - もしくは Domain Service の関数
  で表現する
- Specification が必要なほど複雑になった場合は：
  - その時点で `modeling/specification.md` を作り、  
    設計ルールを明文化した上で導入を検討する

> 「とりあえず Specification で」には絶対にしない。

---

## 7. アンチパターン

- Entity が public field だらけで、どこからでも書き換え可能
- Entity / VO が DB 型（`sql.NullString` など）や JSON タグを持っている
- domain から infra/adapter/usecase を import している
- Repository interface が「なんでも屋」になっている
- Domain Service を「ビジネスロジックのゴミ箱」にしている

これらを見つけたら、Entity / VO / Domain Service / Usecase の  
責務分担を見直す。

---

## 8. 今後の拡張（TODO）

- Domain Event の扱い（採用するか、するならルールをどうするか）
- 集約間に跨るルールを表現する Domain Service の具体パターン
- 権限/ロールモデルの設計（User に持たせるか、別集約にするか）