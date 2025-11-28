# Data Access / Transaction 方針

このドキュメントは Project Roots における  
**データアクセス（DB）とトランザクションのルール** を定義する。

対象は主に：

- `infra/persistence/**`（Repository 実装）
- `infra/db/**`（接続管理）
- `usecase/**`（TxManager の利用）
- `domain/**`（Repository interface）

---

## 1. ゴール

Roots の Data Access で守りたいこと：

1. **domain/usecase は DB の詳細を知らない**
2. **トランザクション制御は usecase 側に集約する**
3. **Repository は「Aggregate 単位」の永続化に専念する**
4. **複雑なクエリ（画面専用）は後から分離できる設計にしておく**

---

## 2. 全体構成

```txt
infra/
  db/
    pg/
      connection.go     // DB 接続・Tx 開始/終了
  persistence/
    pg/
      user_repository.go
      store_repository.go
      survey_repository.go
    // 将来: mongo/ 等
usecase/
  user/
    create_user.go      // TxManager を使う
    update_user.go
domain/
  user/
    repository.go       // interface Repository
```

- `domain`：Repository interface 定義
- `infra/persistence`：Repository 実装
- `infra/db`：DB 接続・トランザクション管理（TxManager 実装）
- `usecase`：TxManager を使ってユースケースごとの Tx を張る

---

## 3. TxManager の設計

### 3.1 抽象（interface）

Usecase からは `TxManager` 抽象だけを見る：

```go
// infra/db/tx_manager.go （インターフェース定義は別パッケージにしても良い）
type TxManager interface {
    WithinTx(ctx context.Context, fn func(ctx context.Context) error) error
}
```

- `WithinTx` は「トランザクション内で関数を実行する」ユーティリティ
- コミット/ロールバックの責務は TxManager が持つ

### 3.2 実装イメージ（PostgreSQL）

```go
// infra/db/pg/tx_manager.go
type TxManagerPG struct {
    db *sql.DB
}

func (m *TxManagerPG) WithinTx(ctx context.Context, fn func(ctx context.Context) error) error {
    tx, err := m.db.BeginTx(ctx, nil)
    if err != nil {
        return err
    }

    // tx を ctx に紐づける（key は専用の型で）
    txCtx := context.WithValue(ctx, txKey{}, tx)

    if err := fn(txCtx); err != nil {
        _ = tx.Rollback()
        return err
    }

    if err := tx.Commit(); err != nil {
        return err
    }

    return nil
}
```

Repository 実装は `ctx` から `*sql.Tx` を取り出してクエリを実行する。

---

## 4. Repository 実装と context

### 4.1 DB / Tx の取り出し

Repository 実装側では、次のような helper を使うイメージ：

```go
func getExecutor(ctx context.Context, db *sql.DB) sqlExecutor {
    if tx, ok := ctx.Value(txKey{}).(*sql.Tx); ok {
        return tx
    }
    return db
}

type sqlExecutor interface {
    ExecContext(ctx context.Context, query string, args ...any) (sql.Result, error)
    QueryContext(ctx context.Context, query string, args ...any) (*sql.Rows, error)
    QueryRowContext(ctx context.Context, query string, args ...any) *sql.Row
}
```

Repository メソッド内では：

```go
func (r *UserRepository) Save(ctx context.Context, u *user.User) error {
    exec := getExecutor(ctx, r.db)

    // exec.ExecContext(...) で INSERT/UPDATE を実行
}
```

### 4.2 Repository は Tx を開始しない

- Repository は `Begin`, `Commit`, `Rollback` を直接呼ばない。
- 与えられた `ctx` に Tx が入っていればそれを使う。
- 無ければ素の `*sql.DB` を使う（非トランザクション）。

トランザクション境界は **Usecase + TxManager** が一元管理する。

---

## 5. Usecase 側での Tx 利用パターン

### 5.1 単純ユースケース

```go
func (uc *CreateUserUsecase) Exec(ctx context.Context, in Input) (*Output, error) {
    var out *Output

    err := uc.tx.WithinTx(ctx, func(txCtx context.Context) error {
        name, err := user.NewName(in.Name)
        if err != nil {
            return err
        }
        email, err := user.NewEmail(in.Email)
        if err != nil {
            return err
        }

        id := user.ID(uc.idGen())
        now := uc.now()

        u, err := user.New(id, name, email, now)
        if err != nil {
            return err
        }

        if err := uc.userRepo.Save(txCtx, u); err != nil {
            return err
        }

        out = &Output{
            ID:    string(u.ID()),
            Name:  string(u.Name()),
            Email: string(u.Email()),
        }
        return nil
    })

    if err != nil {
        return nil, err
    }

    return out, nil
}
```

- Usecase は TxManager に「この処理を Tx 内で動かしてくれ」と依頼するだけ。
- Repository は `txCtx` を通じて「今の Tx or DB」を取得してクエリを打つ。

---

## 6. Command / Query の分離方針（再確認）

Roots v1 では、Command/Query を次のように扱う：

### 6.1 Command Repository（Domain Repository）

- `domain/<aggregate>/Repository` が対象
- 主に：
  - `Save`
  - `FindByID`
  - 必要最小限の finder（`FindByEmail` など）
- Usecase から呼び出される

### 6.2 Query Repository / Read Model（将来）

- 画面専用の複雑なクエリ（JOIN, 集計 等）は
  - `infra/persistence/pg/user_query_repository.go`  
    のような **読み取り専用 Repository** に切り出す
- Domain の Repository interface には載せない
- Usecase は：
  - Command 用 Repository（ドメイン）と
  - Query 用 Repository（読み取り専用）
  を必要に応じて受け取る

v1 ではまず Domain Repository に集中し、  
Query 部分は必要になった時点で設計する。

---

## 7. マイグレーション / スキーマ管理（方針のみ）

- スキーマ定義・マイグレーションはアプリ外のツール（migrate等）で扱う。
- `infra/db/migrations/` などに SQL ファイルを置く構成を検討。
- ドメインモデルと DB スキーマは 1:1 にしないことを許容する（Read Model 等）。

詳細なツール選定・運用フローは別ドキュメントで定義する。

---

## 8. マルチ DB / シャーディング（v1 の扱い）

- Roots v1 では、基本は単一 DB インスタンスを前提とする。
- 将来マルチ DB を導入する場合でも：
  - TxManager 抽象を拡張する
  - Repository 実装を DB ごとに分ける  
  ことで対応する想定。

この段階では「設計がそれを阻害しないこと」を確認する程度に留める。

---

## 9. アンチパターン

- Repository が `Begin`, `Commit`, `Rollback` を直接叩いている
- Usecase が `*sql.DB` / `*sql.Tx` を直接知っている
- Domain が `infra/db` を import している
- Repository が「なんでも検索できる」巨大 IF になっている
- context を無視して `context.Background()` で DB を触っている

---

## 10. まとめ

- トランザクション境界は Usecase + TxManager に集約する
- Repository は ctx から Executor（Tx or DB）を取得してクエリを打つだけ
- Domain は Repository interface だけを知り、DB の詳細は知らない
- 複雑な Query/Read Model は後から分離できる構造にしておく

まずは本ドキュメントに従って実装し、  
現実の運用で困ったポイントが出てきたら、このファイルを更新していく。