# Test Strategy — Project Roots

このドキュメントは Project Roots における **テストレベル・優先度・必須カバレッジ・テーブル駆動テストの標準** を定義する。

- どこをどの粒度でテストするか
- どこは **必ずテーブル駆動テストにするか**
- LLM にテスト生成を任せるときのルール

をここで一本化する。

---

## 1. テストレベルと優先順位

Roots の Go バックエンドは、以下のレベルでテストを書く。

1. **Unit Test（最重要）**
   - 対象: domain / usecase / 小さな adapter ロジック
   - 手法: **テーブル駆動テストがデフォルト**
2. **Integration Test**
   - 対象: infra（DB, 外部API, メッセージング）
   - 手法: testcontainers / docker-compose / in-memory fake 等
3. **API / E2E Test（必要に応じて）**
   - 対象: HTTP エンドポイント、主要ユースケースのフロー

優先度は:

> Unit（純粋ロジック） > Integration（接続確認） > API/E2E（スモーク）

---

## 2. レイヤー別に「どこをテスト必須とするか」

### 2.1 domain レイヤー（最優先・必須）

**必ず単体テストを書く対象:**

- **Value Object（VO）**
  - 生成（New系 コンストラクタ）
  - 不変条件（不正値の拒否）
  - 変換ロジック（`ToXXX`, `FromXXX`）
- **Entity**
  - 生成（New）
  - 状態遷移メソッド（`Activate`, `Deactivate`, `ChangeName` など）
  - ビジネスルールに関わるメソッド（料金計算、ステータス判定 等）
- **Domain Service**
  - ドメインロジックを詰めた純粋関数的な部分

**domain のテスト方針:**

- すべて **テーブル駆動テスト** を標準とする
- 正常系 / 境界値 / 異常系（エラー）を 1 テーブル内で表現する
- 例外的なシナリオもテーブルに追加していくスタイル

---

### 2.2 usecase レイヤー

**原則テストを書く対象:**

- 1つのユースケースとして意味を持つ公開メソッド:
  - `Exec`, `Handle`, `Run`, `Do` などのエントリポイント
- 以下を含む場合は **必須**:
  - 2つ以上の Repository / Service をオーケストレーションしている
  - トランザクション境界（TxManager）を扱っている
  - ビジネス的に重要な分岐がある（承認/拒否、在庫あり/無し 等）

**usecase のテスト方針:**

- Repository / TxManager / 外部サービスは **interface の mock/fake** を注入する
- 複数ケースを扱うため、原則 **テーブル駆動テスト** にする
  - 例: 「成功」「リポジトリエラー」「入力不正」「ドメイン例外」など

---

### 2.3 adapter レイヤー（HTTPなど）

**テスト対象:**

- HTTP Handler の **リクエスト→Usecase入力マッピング**
- Usecase の出力→HTTP レスポンス（ステータスコード/Body）のマッピング
- バリデーション・認証・認可の分岐

**方針:**

- ルーティングの詳細は最低限（疎通確認程度）
- Handler 単位で、以下を **テーブル駆動テスト** にする:
  - バリデーションエラー（400）
  - 認証エラー（401/403）
  - 正常系（200/201）
  - 内部エラー（500）

テーブルの各ケースで：

- 入力 HTTP メソッド / URL / Body / Header
- Mock Usecase の返り値 or エラー
- 期待ステータスコード / JSON Body 部分一致

を定義する。

---

### 2.4 infra レイヤー（DB / external）

**原則:**

- infra は「技術詳細」であり、仕様変更の頻度が高く壊れやすい
- 純粋単体でテストするより、**Integration Test** を優先する

**テスト必須の対象:**

- Repository 実装（DB との保存・取得）
- 外部APIクライアントの薄いラッパ（HTTP リクエスト組み立て & エラーハンドリング）

**スタイル:**

- 単体テストというより、`_test.go` から Test DB / Test Server を立てる
- テーブル駆動テストを使うかどうかはケース数次第（必須ではない）

---

## 3. テーブル駆動テストの標準スタイル

### 3.1 基本形（Go）

```go
func TestXxx(t *testing.T) {
    t.Parallel()

    tests := []struct {
        name    string
        input   InputType
        want    WantType
        wantErr error // or bool
    }{
        {
            name:  "正常系: 〜〜〜",
            input: InputType{ /* ... */ },
            want:  WantType{ /* ... */ },
        },
        {
            name:    "異常系: 不正な入力の場合",
            input:   InputType{ /* ... */ },
            wantErr: ErrInvalidSomething,
        },
        // ...
    }

    for _, tt := range tests {
        tt := tt
        t.Run(tt.name, func(t *testing.T) {
            t.Parallel()

            got, err := Xxx(tt.input)

            if tt.wantErr != nil {
                if !errors.Is(err, tt.wantErr) {
                    t.Fatalf("expected error %v, got %v", tt.wantErr, err)
                }
                return
            }

            if err != nil {
                t.Fatalf("unexpected error: %v", err)
            }

            if diff := cmp.Diff(tt.want, got); diff != "" {
                t.Errorf("Xxx() mismatch (-want +got):\n%s", diff)
            }
        })
    }
}
```

### 3.2 必須ルール

- **名前付きケース (`name string`) は必須**
- 正常系 / 異常系 / 境界条件を **1 つの tests スライスにまとめる**
- `t.Run` を使ってサブテストにする
- 並列安全なら `t.Parallel()` を使う（I/O を伴うものは注意）
- 複雑な比較は `cmp.Diff` または `cmpopts` を使う

---

## 4. 「テーブル駆動テストが必須な領域」

明示的に **テーブル駆動でないとダメ** とする範囲：

1. **Value Object**
   - すべての NewXXX コンストラクタ
   - バリデーションロジック（min/max/regex/必須・任意）
   - 代表的な変換メソッド（例: `String()`, `MarshalText` 等）

2. **Entity の状態遷移**
   - 状態遷移メソッド（例: Activate/Deactivate/Archive）
   - 状態に応じた分岐（例: isDeletable, CanReserve 等）

3. **Domain Service**
   - ビジネスルールを詰めた関数・メソッド

4. **Usecase のエントリポイント**
   - `Exec`, `Handle`, `Run` など
   - 正常系 / 各種エラー（Repository/Domain/Validation）をケースとして持つ

5. **HTTP Handler（adapter/http）**
   - バリデーションの成功/失敗
   - 権限エラー
   - Body のパースエラー
   - Usecase エラー → ステータス変換

---

## 5. カバレッジの目標値と妥協ライン

### 5.1 目標値（理想）

- **domain**: 90〜100%
- **usecase**: 70〜90%
- **adapter**: 50〜70%（重要エンドポイントは 80% 以上）
- **infra**: 数値ではなく「主要クエリと接続が叩けていること」を重視

### 5.2 現実ライン

- 特定の VO / Entity / Usecase が **バグの温床になっている** と感じたら  
  その部分のカバレッジを最優先で上げる。
- カバレッジツールの数値より「バグを再発させないためのテーブル」が重要。

---

## 6. LLM / エージェントにテスト生成を任せるときのルール

### 6.1 共通ルール

LLM にテストを書かせるときは、必ず次を伝える：

1. 対象コードのパスと役割
2. `docs/test_strategy.md` を読ませること
3. DDD レイヤーと対象の責務（domain/usecase/adapter/infra）
4. 正常系 / 異常系 / 境界ケースの例

### 6.2 LLM への指示テンプレ（例）

> 次のファイルに対する Go のテーブル駆動単体テストを書いてください。  
> - 対象: `apps/makotoclub/backend/api/internal/domain/store/vo_name.go`  
> - 目的: NewName のバリデーションを網羅的にテストすること  
> - 参照ルール: `docs/test_strategy.md`（テスト戦略）  
>  
> 要求:  
> - 正常系/異常系/境界値を含むテーブル駆動テストにすること  
> - サブテスト (t.Run) を使うこと  
> - `cmp.Diff` を使って構造体の差分を比較すること  
> - エラーメッセージ文字列ではなく、error 型または sentinel error で判定すること

---

## 7. レイヤーごとの「テストしない」判断基準

むやみにテストを書かず、以下のものは **積極的にユニットテスト対象から外して良い**：

- 純粋な DTO（フィールドだけの struct）
- 単なるラッパ関数（log 出力だけ、panic 変換だけ 等）
- フレームワークに強く依存していて、将来まるごと差し替える予定の層

ただし、

- バグが出た箇所
- 仕様が難しいと感じた箇所

は **原則テスト追加してから fix する**。

---

## 8. 今後の拡張

- testcontainers を使った DB / Redis / 外部API の Integration Test 指針を追加
- HTTP Handler 用の共通テスト helper（`httptest` ラッパ）の標準化
- フロントエンド（Next.js）側のテスト方針（Playwright / Vitest 等）が固まったら別章で追記

---

この `docs/test_strategy.md` は、  
**「どの層にどんなテストを、どのスタイルで絶対に書くか」** を決める中核ドキュメント。

LLM にテスト生成を任せるときは、  
必ずこのファイルを読ませてからプロンプトを書くこと。