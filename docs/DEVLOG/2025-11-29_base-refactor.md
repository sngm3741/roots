# Base Services Rebuild ExecPlan  
(Refactor of legacy `base-services` → new Architecture/DDD spec)

このドキュメントは、旧 `__before/base-services` を  
**Project Roots の新仕様（architecture / DDD / config_rules）に完全準拠して再構築するための実行計画**である。

LLM（Codex / Cursor / GPT）に渡すための **指示書テンプレート** も含む。

---

# 0. 対象スコープ（Phase 1）

まずは以下のみ対象とする：

### **auth-line（LINE Login OAuth 認証）**

理由：

- 依存が少なく、最も移植しやすい
- base/auth の中心機能で、他アプリにも使う
- “1サービスを新構造で再構築する”ための最小単位として最適  
- Messenger / Upload / Discord / Twitter を同時にやると破綻する

---

# 1. 新しいディレクトリ構造（base/auth）

```
base/
    auth/
      backend/
        cmd/
          main.go
        internal/
          domain/
            user/
              entity.go
              vo/
                line_id.go
                access_token.go
            session/
              entity.go
          usecase/
            line_login.go
          adapter/
            http/
              handler.go
              router.go
          infra/
            external/
              line/
                client.go
            persistence/
              pg/
                user_repository.go
                session_repository.go
              redis/
                session_cache.go
        go.mod
        go.sum
```

### 移植の原則：

- **domain**：ビジネスルール（Entity/VO/Repository IF）
- **usecase**：OAuth の流れ、トークン発行、Session の発行
- **adapter**：HTTP Handler / Router
- **infra**：LINE API / DB / Redis との通信
- **cmd**：DI してサーバー起動

---

# 2. 旧構造から新構造への対応表

| 旧ファイル | 新配置 | 備考 |
|-----------|--------|------|
| config.go | infra/config or adapter/http | Config の責務次第で分割 |
| server.go | adapter/http/server.go | HTTP サーバー立てる |
| state.go | infra/persistence/redis/session_cache.go | Session 管理 |
| line.go | infra/external/line/client.go | LINE API クライアント |
| main.go | cmd/main.go | DI してサーバー起動 |
| 認証のロジック | usecase/line_login.go | ビジネスフローへ |
| DB操作 | infra/persistence/pg/* | Domain repo の実装へ |

---

# 3. LLM に渡す前提資料

以下の md を **必ず読み込ませる**こと：

- `docs/architecture.md`
- `docs/config_rules.md`
- `docs/ddd/index.md`
- `docs/ddd/layers/*`
- `docs/ddd/modeling/*`
- `docs/ddd/rules/data-access.md`

＋以下の実ファイルも読み込ませる：

- `__before/base-services/auth-service/auth-line/**`

---

# 4. LLM に渡す実行指示（テンプレ）

以下をそのまま Codex / GPT に投げればよい：

---

## 🔽 **実際に渡すプロンプト（コピペ用）**

````md
# Task
旧 "__before/base-services/auth-service/auth-line" を
Project Roots の新仕様（architecture, DDD, config_rules）に準拠した構造で作り直してください。

# 必ず読む資料
- docs/architecture.md
- docs/config_rules.md
- docs/ddd/index.md
- docs/ddd/layers/**
- docs/ddd/modeling/**
- docs/ddd/rules/data-access.md

# 出力フォーマット
- 1ファイルずつ、ファイルパスとコードをまとめて提出
- 大量のファイルを一括生成しないこと
- diff やリネームも可視化して説明すること

# 制約
- 旧コードの挙動は変えない（リファクタのみ）
- DDD の責務分離に沿うこと
- config は adapter/http or infra/config に再配置
- LINE API 通信は "infra/external/line/client.go" に集約
- Repository は domain に interface、infra に実装を配置
- usecase は OAuth フローの制御のみ行う
- main.go は cmd に置き、DI して HTTP サーバー起動

# 最初の出力
1. 新ディレクトリ一覧（tree）
2. 各ファイルの役割説明
3. 次に着手すべきファイル（1つだけ）

````

---

# 5. この ExecPlan の意図

- LLM が「勝手に作り変える」のを防ぎ、  
  **Docs → 設計 → 1ファイルずつ**の順番で進めるためのガードレール。
- 特に Codex（Cursor）は「一括大量生成」をしがちなので、  
  あえて **1ファイルずつ**に制限している。

---

# 6. 次フェーズ（参考）

- Phase 2: auth-discord / auth-twitter への水平展開  
- Phase 3: messenger-line / messenger-discord 再構築  
- Phase 4: upload-service 移植  
- Phase 5: base services CI/CD 整備  
- Phase 6: apps/ との接続（auth 公開API）  

---

# まとめ

この ExecPlan を LLM に渡せば  
base/auth の再構築を安全に、ドキュメント準拠で進められる。

必要に応じてこのファイルを更新しながら使うこと。

---

## Progress

- [x] (2025-11-29 10:00) 既存コード・docs の調査完了
- [x] (2025-11-29 11:00) DDD観点での設計方針を固める
- [x] (2025-11-29 12:30) domain 層の実装（user ID/表示名/アイコン）
- [x] (2025-11-29 13:30) usecase 層の実装（LINE loginフロー、命名をUsecaseに統一）
- [x] (2025-11-29 14:30) adapter 層の実装（HTTP/CORS/リダイレクト）
- [x] (2025-11-29 15:00) infra 層の実装（LINE APIクライアント）
- [x] (2025-11-29 16:00) テスト & 動作確認（ユニットテスト追加、go test ./...）
- [x] (2025-11-29 17:00) リファクタリング & 後片付け（Phase1クローズ手順）

## Decision Log

- Decision: LINE loginのユースケースは`usecase/linelogin/line_login.go`にまとめ、曖昧なService命名を避ける  
  - Rationale: ExecPlan/DDDで「Usecase=Application Service」と定義しており、責務を明瞭にするため  
  - Date/Author: 2025-11-29 / taiichi
- Decision: state管理はHMACペイロードのみで完結（外部ストアなし）  
  - Rationale: 旧実装踏襲で挙動を変えないため  
  - Date/Author: 2025-11-29 / taiichi
- Decision: JWT発行はUsecase内TokenIssuerに閉じ、他ユースケース共通化はPhase2以降に検討  
  - Rationale: Phase1スコープで重複が無く、小さくまとめるため  
  - Date/Author: 2025-11-29 / taiichi

## Surprises & Discoveries

- Observation: もともとExecPlan本文にProgress/Decisionセクションが無かったため追記した  
  - Evidence: docs/DEVLOG/2025-11-29_base-refactor.md 末尾に追加  
  - Files: docs/DEVLOG/2025-11-29_base-refactor.md
