# Adapter Layer 方針（HTTP / gRPC / CLI / Webhook）

このドキュメントは Project Roots における  
**adapter レイヤー（インターフェースアダプタ層）** のルールを定義する。

対象は主に `backend/adapter/` 配下の：

- HTTP ハンドラ（REST, Webhook など）
- gRPC サービス実装
- CLI コマンド
- その他 I/O の境界（キューコンシューマ 等）

---

## 1. 役割とゴール

Adapter Layer のゴールは：

- **外界（HTTP/gRPC/CLI）と usecase をつなぐ変換レイヤー** になること
- プロトコル・フォーマット・認証情報などの「外界の都合」を吸収し、  
  usecase には **純粋な入力データだけ渡す** こと
- usecase からの結果やエラーを **プロトコル固有のレスポンス形式に変換する** こと

つまり、Adapter は「I/O の翻訳者」であり、  
ビジネスルールは一切持たない。

---

## 2. ディレクトリ構成

### 2.1 全体構成

```txt
backend/
  adapter/
    http/
      user/
        handler.go
        dto.go
      store/
        handler.go
        dto.go
      survey/
        handler.go
        dto.go
    grpc/
      user/
        service.go
        dto.go
    cli/
      root.go
      user_cmd.go
    webhook/
      line/
        handler.go
```

- プロトコル別（`http`, `grpc`, `cli`, `webhook`）にトップレベルを分ける
- その下で **ユースケース / 集約別** にディレクトリを切る
- DTO 定義は `dto.go` にまとめる

---

## 3. DTO（Request/Response）の扱い

### 3.1 DTO は adapter 専用の struct

- DTO（Data Transfer Object）は **adapter 専用** とする
- Entity / VO を直接 JSON や Protobuf に晒さない
- DTO はプロトコルごとに定義する：

```go
// adapter/http/user/dto.go
type createUserRequest struct {
    Name  string `json:"name"`
    Email string `json:"email"`
}

type createUserResponse struct {
    ID    string `json:"id"`
    Name  string `json:"name"`
    Email string `json:"email"`
}
```

### 3.2 Usecase Input/Output とのマッピング

1. HTTP Request → DTO（JSON bind）
2. DTO → Usecase Input
3. Usecase Output → DTO
4. DTO → HTTP Response（JSON encode）

```go
// adapter/http/user/handler.go
func (h *Handler) CreateUser(w http.ResponseWriter, r *http.Request) {
    var req createUserRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        // 400 Bad Request
        return
    }

    in := usecase.CreateUserInput{
        Name:  req.Name,
        Email: req.Email,
    }

    out, err := h.uc.CreateUser.Exec(r.Context(), in)
    if err != nil {
        h.handleError(w, r, err)
        return
    }

    resp := createUserResponse{
        ID:    out.ID,
        Name:  out.Name,
        Email: out.Email,
    }

    // 201 Created
    _ = json.NewEncoder(w).Encode(resp)
}
```

---

## 4. Adapter がやること / やらないこと

### 4.1 Adapter がやること

- プロトコル固有の処理：
  - HTTP パス/クエリ/ヘッダ/ボディのパース
  - gRPC の request/response 生成
  - CLI 引数パース
- DTO の構築と usecase 入力への変換
- usecase 出力をレスポンス形式に変換
- HTTP ステータスコードや gRPC ステータスの決定
- 認証情報の取り出し（ヘッダ/トークン 等）
- ロギング/メトリクス（必要に応じて）

### 4.2 Adapter がやらないこと

- ビジネスルールの判定（それは domain/usecase）
- DB や外部APIの直接呼び出し
- Entity/VO の生成（基本は usecase に任せる）
- トランザクション開始/終了

---

## 5. エラーの扱いとマッピング

### 5.1 ドメインエラー → HTTP/gRPC へのマッピング

Adapter は、usecase/domain が返すエラーを見て  
**ステータスコード / レスポンスメッセージ** を決める。

例（HTTP の場合）：

```go
func (h *Handler) handleError(w http.ResponseWriter, r *http.Request, err error) {
    switch {
    case errors.Is(err, user.ErrNotFound):
        http.Error(w, "user not found", http.StatusNotFound)
    case errors.Is(err, user.ErrInvalidEmail):
        http.Error(w, "invalid email", http.StatusBadRequest)
    default:
        http.Error(w, "internal server error", http.StatusInternalServerError)
    }
}
```

- Domain 側で定義したエラー（`ErrNotFound`, `ErrInvalidXXX` 等）をキーに判定する
- エラーメッセージはクライアント向けに調整してよい（domain の文言は内部向け）

### 5.2 技術エラー

- DB接続エラーなどの技術エラーは、基本的に 500 系にマッピングする
- ログには詳細を残す

---

## 6. 認証 / 認可のポリシー（v1）

Roots v1 では、認証/認可は次のように扱う：

- **認証（Authentication）**
  - Adapter がトークン/セッションクッキー等から「誰か」を特定
  - user ID 等を context or usecase input に渡す
- **認可（Authorization）**
  - 原則として usecase or domain に委ねる（ビジネスルールに近いため）
  - シンプルなロールチェック程度なら adapter 側でも可（v1の割り切り）

例：

```go
userID, err := h.auth.ExtractUserID(r)
if err != nil {
    http.Error(w, "unauthorized", http.StatusUnauthorized)
    return
}

in := usecase.CreateStoreInput{
    OwnerID: userID,
    // ...
}
```

**「誰か？」の解決 = adapter**  
**「この誰かがこれをしてよいか？」の判断 = usecase/domain**  
という分担を基本とする。

---

## 7. バリデーションとの関係

- 入力値バリデーションは二重構造で考える：

  1. **フォーマットレベル（必須/型/範囲チェック）**  
     → adapter or usecase で実施してもよい  
     → ユーザー入力の「形式エラー」を早期に返す

  2. **ビジネスルールレベルの検証**  
     → VO / Entity / Domain Service で行う  
     → 「業務的にその値が許されるか」の判定

- adapter 側でやるのは主に「リクエストとして成り立っているか？」の確認。
- 「このメールアドレスはドメインルール上 OK か？」は VO の責務。

---

## 8. Handler の基本スタイル（HTTP）

Roots では、HTTP Handler の基本テンプレを次のように決める：

```go
func (h *Handler) SomeAction(w http.ResponseWriter, r *http.Request) {
    ctx := r.Context()

    // 1. 認証情報の取り出し（必要なら）
    userID, err := h.auth.ExtractUserID(r)
    if err != nil {
        http.Error(w, "unauthorized", http.StatusUnauthorized)
        return
    }

    // 2. リクエスト DTO へのバインド
    var req someActionRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        http.Error(w, "bad request", http.StatusBadRequest)
        return
    }

    // 3. Usecase Input への変換
    in := usecase.SomeActionInput{
        UserID: userID,
        // ...
    }

    // 4. Usecase 呼び出し
    out, err := h.uc.SomeAction.Exec(ctx, in)
    if err != nil {
        h.handleError(w, r, err)
        return
    }

    // 5. Output → Response DTO に変換
    resp := someActionResponse{
        // ...
    }

    // 6. レスポンス送信
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(http.StatusOK)
    _ = json.NewEncoder(w).Encode(resp)
}
```

この構造を **全 Handler で統一** することで、  
読む側・書く側の負担を減らす。

---

## 9. gRPC / CLI / Webhook でも同じ思想

- gRPC でも「proto ↔ DTO ↔ usecase input/output」の関係は同じ
- CLI でも「引数/フラグ ↔ DTO ↔ usecase input/output」の関係は同じ
- Webhook でも「外部サービスのペイロード ↔ DTO ↔ usecase input/output」の関係は同じ

**プロトコルが違うだけで、責務分担は同じ** ということを徹底する。

---

## 10. アンチパターン

- Handler 内で Repository や DB クライアントを直接叩く
- Handler 内で生 SQL を書く
- Entity/VO をそのまま JSON にエンコードして返す
- adapter から domain のエラー内容をそのままユーザーに見せる
- 認証/認可ロジックが usecase / domain に分散している

これらを見つけたら、adapter/usecase/domain の責務分担を疑う。
