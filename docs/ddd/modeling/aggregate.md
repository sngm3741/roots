# Aggregate モデリング方針

このドキュメントは Project Roots における  
**Aggregate（集約）の設計・実装ルール** を定義する。

対象は主に `backend/domain/<aggregate>/` 配下の：

- `entity.go`（集約ルートの Entity）
- `vo_*.go`（その集約に属する Value Object）
- 必要なら `entity_*.go`（集約内サブ Entity）
- `repository.go`（集約ルート用 Repository interface）
- 必要に応じた Domain Service（`service_*.go`）

---

## 1. Aggregate とは（Roots の定義）

Roots における Aggregate は、DDD の定義に基づき、次を満たすものとする：

- **あるビジネスルールのまとまりを表すオブジェクト群**
- **常に一貫性を保つべき境界（トランザクション境界）**
- **1つの Aggregate Root（集約ルート）を中心に構成される**
- **外部から直接参照されるのは Aggregate Root だけ**

イメージ：

- User 集約
- Store 集約
- Survey 集約
- Order 集約 など

---

## 2. 物理構造と命名ルール

### 2.1 ディレクトリ構成

1集約 = 1ディレクトリ とする。

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

- ディレクトリ名：集約名の単数形（英語）
  - `user`, `store`, `survey`, `order` など
- パッケージ名：ディレクトリ名と同じ（`package user` など）

### 2.2 ファイルの役割

- `entity.go`
  - 集約ルートを定義
- `entity_*.go`
  - 集約内のサブ Entity を分割したいときに使用（必要な場合のみ）
- `vo_*.go`
  - その集約に属する Value Object
- `repository.go`
  - 集約ルートを扱う Repository interface
- `service_*.go`
  - 集約に関わる Domain Service（必要な場合のみ）

---

## 3. Aggregate Root の責務

Aggregate Root は次を担う：

- 集約全体の **不変条件（invariant）を守る責任者**
- 集約内のサブ Entity や VO を通じた状態遷移の「窓口」
- Repository からのロード/保存の単位

### 3.1 不変条件（Invariant）の扱い

不変条件とは：

- 「どの時点でも常に成り立っていなければならないビジネスルール」

例：

- User：
  - `DeletedAt` がセットされているユーザーはログインできない
- Store：
  - `Open` フラグが false のときは注文を受け付けない
- Survey：
  - `Now` が期間外のときは回答を受け付けない

Roots では次のように扱う：

- 不変条件は **可能な限り Entity（Aggregate Root）内に実装する**
- 状態を変更するメソッド（`ChangeName`, `Open`, `Close`, `Answer` 等）は、  
  不変条件を破るような変更を拒否する（エラーを返す）
- サブ Entity の変更も必ず Root 経由にし、Root が全体を見てチェックできるようにする

### 3.2 Domain Service との役割分担

不変条件が：

- 1つの Entity のフィールドで完結する → Entity メソッドで表現
- 複数 Entity / VO を跨ぐが、DB/外部APIには依存しない → Domain Service で表現
- DB/外部APIと密接に絡む → Usecase でオーケストレーション

特に、「複数 Aggregate を跨ぐ不変条件」は要注意で、  
その場合は **Aggregate の切り方自体を見直す** 候補。

---

## 4. 境界の考え方（どこまでを1集約とみなすか）

### 4.1 Aggregate 境界の原則

次の条件を満たす「まとまり」を 1 Aggregate として扱う：

1. **一度の操作で整合性を保ちたいオブジェクト群**
2. **基本的に同一トランザクション内で更新される単位**
3. **外部からは Aggregate Root 経由でしか触らない**

逆に言うと：

- 「同時に更新されることはほぼない」
- 「整合性を eventually で許容できる」

ような関係は、別 Aggregate に切る候補。

### 4.2 VO か Sub-Entity か、別 Aggregate か

判断の軸：

1. **ライフサイクルが独立しているか**
   - User と UserProfile が「同時に作られて同時に消える」なら User 集約内のサブ Entity or VO
   - 別々に作られたり削除されたりするなら 別集約の候補

2. **一貫性の境界**
   - 更新ごとに「同時に整合性を保ちたい」なら同一集約
   - 多少ずれても良いなら別集約 + イベント or usecase で連携

3. **サイズと頻度**
   - 巨大なグラフになる場合は、readモデルの工夫 or 集約分割を検討

---

## 5. 集約間の参照ルール

### 5.1 他の Aggregate を「直接」持たない

NG：

```go
// domain/store/entity.go
type Store struct {
    id    ID
    owner *user.User  // ← 他集約の Entity を直接保持（禁止）
}
```

OK：

```go
type Store struct {
    id      ID
    ownerID user.ID   // 他集約は ID で参照する
}
```

- Aggregate 間の関連は **ID 参照に限定** する。
- 実際の `User` オブジェクトが必要なら usecase 側で Repository を通じて取得する。

### 5.2 双方向依存の禁止

NG：

- `user` パッケージが `store` を import
- `store` パッケージも `user` を import

こうなったら **集約の切り方を見直す**。

---

## 6. Repository と Aggregate

### 6.1 Repository は「Aggregate Root」単位

各集約ごとに `repository.go` を用意し、  
**Aggregate Root 単位で永続化する interface** を定義する。

```go
// domain/user/repository.go
package user

type Repository interface {
    Save(ctx context.Context, u *User) error
    FindByID(ctx context.Context, id ID) (*User, error)
}
```

インターフェース名は `Repository` で統一し、  
パッケージ名で区別する方針とする。

### 6.2 Save の意味

- `Save` は「集約全体を永続化する」の意味。
- 集約内部のサブ Entity をバラバラに保存する API は基本作らない。

### 6.3 Query 用 Repository との関係

読み取り専用の複雑なクエリ（JOIN多用、画面専用ビューなど）は、  
別途 **Query 用 Repository** を作ってもよい（詳細は `modeling/repository.md` / `rules/data-access.md` に委ねる）。

---

## 7. Usecase から見た Aggregate の扱い

### 7.1 Usecase の役割

Usecase は次を担当する：

- 必要な Aggregate を Repository からロードする
- ユースケースに応じて Aggregate のメソッドを呼ぶ
- 必要に応じて複数 Aggregate をまたいで調整する（が、ルールはできるだけ Aggregate に寄せる）

### 7.2 単一 Aggregate を更新するケース

典型的なパターン：

```go
func (uc *UpdateUserProfileUsecase) Exec(ctx context.Context, in Input) (*Output, error) {
    u, err := uc.userRepo.FindByID(ctx, in.UserID)
    if err != nil {
        return nil, err
    }

    if err := u.UpdateProfile(in.Profile, uc.now()); err != nil {
        return nil, err
    }

    if err := uc.userRepo.Save(ctx, u); err != nil {
        return nil, err
    }

    return &Output{ID: u.ID()}, nil
}
```

- ロード → 集約内メソッドで状態変化 → Save  
という1本の流れ。

### 7.3 複数 Aggregate を触るケース

例：User と Store を同時に扱うユースケース。

原則：

- 1つのトランザクションでまとめてもよいが、  
  その場合でも **Aggregate の不変条件が崩れないように** 注意する。
- 「User と Store を同時に更新しないと一貫性が保てない」なら、  
  そもそもの Aggregate 境界設計を見直すべき可能性が高い。

---

## 8. トランザクションと一貫性（Aggregate 視点）

### 8.1 基本方針

- 1ユースケース内で **1つの Aggregate Root を更新する** のが理想。
- 複数 Aggregate を更新する必要がある場合：
  - それは「ビジネスの都合」であり、「データ構造の都合」ではないかを確認する
  - 可能であれば eventually consistent（イベント + 後続処理）を検討

### 8.2 Roots v1 の現実的運用

v1 では：

- DB は単一インスタンス内で始まることが多い
- そのため、技術的には「複数 Aggregate を1トランザクションで更新」は可能

ただし設計思想としては：

- **Aggregate はできるだけ単独で完結** させる
- 「どうしても複数 Aggregate の同時更新が必要」なケースは  
  `rules/data-access.md` 側で「例外ルール」として記録する

---

## 9. REST/API と Aggregate の関係

### 9.1 リソース ≒ Aggregate Root

- HTTP API のリソース設計は、基本的に Aggregate Root 単位とする。

例：

- `GET /users/{id}` → User Aggregate Root を返す or 要約DTO
- `GET /stores/{id}` → Store Aggregate Root
- `GET /surveys/{id}` → Survey Aggregate Root

### 9.2 子 Entity の扱い

- 集約内のサブ Entity を「単独の API リソース」として切り出すのは慎重に検討する。
- 多くの場合：

  - `POST /users/{id}/profile` のような、  
    「親にぶら下げる形の API」で十分。

---

## 10. Aggregate モデリングの判断基準まとめ

Aggregate として切るべきか？ それとも VO / サブ Entity か？  
判断軸をもう一度整理する：

1. **常に一緒に整合性を保つ必要があるか？**
2. **ライフサイクルは本当に一体か？**
3. **外部から見たとき、1つの「概念」に見えるか？**
4. **トランザクション境界として自然か？**
5. **過度に巨大になっていないか？（操作対象が膨大すぎないか？）**

---

## 11. アンチパターン

次のような形を見かけたら、Aggregate 設計の見直し候補：

- 他集約の Entity をそのままフィールドに持っている
- 集約内のデータを、テーブル＝Entity＝Aggregate と 1:1 対応させてしまっている
- Repository が「子 Entity を単独保存する API」をいくつも持っている
- usecase 側で if/else によるビジネスルールが乱立し、Entity/VO に何も責務がない
- 1つのユースケースが、毎回3つ4つの Aggregate を更新している
- 「とりあえず全部 User 集約」に突っ込んで巨大 God Aggregate になっている

---

## 12. 今後の拡張（TODO）

- Domain Service の設計方針（Aggregate を跨ぐルールをどう表現するか）
- Domain Event の扱い（Aggregate Root からイベント発行するか）
- 読み取り専用モデル（Read Model）との役割分担
- 分散システム化した場合の、「集約境界」と「マイクロサービス境界」のすり合わせ