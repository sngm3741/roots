# Config Rules — Project Roots

このドキュメントは Project Roots における  
**環境変数（.env）および設定ファイルのルール** を定義する。

目的は：

- `.env` 地獄を防ぐ
- 「どこに何を定義すべきか」を明文化する
- domain/usecase が設定取得ロジックで汚れないようにする

---

## 1. 基本方針

1. **テンプレートはリポジトリに置くが、実値（秘密情報）は置かない**
   - テンプレ：`infra/configs/templates/**`
   - 実際の `.env` や本番設定値は Git 管理しない（VPS / Secret 管理に載せる）

2. **アプリ・サービス単位でテンプレートを分ける**
   - `apps/<app>/` 系
   - `base/<service>/` 系

3. **環境差分は「テンプレート」ではなく「実ファイル」で表現する**
   - `*.env.dist` は「必要なキー一覧＆説明」
   - `dev / local / prod` の値は `.env` / `.env.local` などで実際に与える

4. **環境変数を読んでよい層を限定する**
   - 読んでよい：`cmd`, `infra`, （必要最小限の `adapter`）
   - 読んではいけない：`domain`, `usecase`

---

## 2. テンプレート配置ルール

テンプレートは **すべて `infra/configs/templates/` に集約する。**

```
infra/
  configs/
    templates/
      apps/
        makotoclub/
          backend.env.dist
          common.env.dist
          frontend.env.dist
      base/
        auth/
          common.env.dist
        message/
          common.env.dist
```

### 2.1 apps 用

- `infra/configs/templates/apps/<app>/backend.env.dist`
- `infra/configs/templates/apps/<app>/frontend.env.dist`
- `infra/configs/templates/apps/<app>/common.env.dist`

### 2.2 base 用

- `infra/configs/templates/base/<service>/common.env.dist`

---

## 3. 実際の .env ファイル運用

### 3.1 ローカル開発

- `apps/<app>/backend/.env`
- `apps/<app>/frontend/.env.local`

### 3.2 ステージング / 本番（VPS 等）

- VPS 上の `.env`
- Docker Compose の `env_file`
- CI/CD の Secrets 経由

---

## 4. 環境変数の命名・意味付け

- **SCREAMING_SNAKE_CASE**
- prefix 推奨：`APP_`, `DB_`, `REDIS_`, `EXT_`, `STORAGE_`

テンプレの例：

```
# アプリケーションモード
APP_ENV=

# 公開URL
APP_BASE_URL=

# DB
DB_HOST=
DB_PORT=5432
DB_USER=
DB_PASSWORD=
DB_NAME=
```

---

## 5. env を読んでよい層

- 読んでよい：`cmd`, `infra`（+ adapter最小限）
- 読んではいけない：`domain`, `usecase`

推奨パターン：`cmd` で `loadConfigFromEnv()` を実行し、Config struct に詰める。

```go
type AppConfig struct {
    Env       string
    HTTPPort  string
    DB        DBConfig
    Line      LineConfig
}
```

---

## 6. templates と scripts の関係

- テンプレは「定義」
- scripts は「検証 / 初期生成」

---

## 7. LLM / Codex へのコンテキスト

- `architecture.md`
- `config_rules.md`
- `templates/**`
- `apps/<app>/docs/development.md`

を渡せば環境変数構造がすべて伝わる。

---

## 8. 見直しタイミング

- base/app の追加時
- env 管理方法の変更時
- env 関連バグ発生時

コードより先にこのドキュメントを更新する。