# architecture — Project Roots

このドキュメントは **Project Roots 全体の構造・責務・レイヤー思想・命名規約** の中核となる仕様書である。  
全アプリ・全サービス・全インフラが従うべき「唯一の構造基準」をここに定義する。

- 新しいアプリを追加するとき
- 既存サービスをリファクタリングするとき
- LLM（Codex / ChatGPT）に設計を理解させるとき

常に最初に参照すべきドキュメントが本書。

---

## 0. プロジェクトの前提思想

Project Roots は：

- 複数のアプリケーション（`apps/`）と
- 共通基盤サービス（`base/`）と
- それらを支えるインフラテンプレ（`infra/`）と
- 全体ルール（`docs/`）

から構成される「マルチプロダクト・マルチサービス」の世界である。

バックエンドは **DDD + Clean Architecture（4レイヤー）** を採用し、  
その詳細ルールは `docs/DDD/` 以下に完全に定義されている。

---

## 1. ルートディレクトリ構成

```txt
roots/
├── apps/        # 各プロダクトアプリ
├── base/        # 共通基盤サービス（auth/message 等）
├── docs/        # 全体仕様書・ルール・方針
└── infra/       # インフラ（configs/docker/scripts）
```

### 1.1 apps/

- 具体的なプロダクトアプリを配置する。
- 各アプリは backend / frontend / docs を持つ独立した「世界」。

```txt
apps/
  makotoclub/
    backend/
    frontend/
    docs/
  kusakari/
    backend/
    frontend/
    docs/
  tink/
    backend/
    frontend/
    docs/
```

### 1.2 base/

- 複数アプリから利用される共通基盤サービス群。
- 例：`auth/`, `message/` など。

```txt
base/
  auth/
  message/
```

**依存方向：**

- `apps` → `base` への依存は許可
- `base` → `apps` への依存は禁止（共通基盤として独立）

### 1.3 docs/

- プロジェクト全体のルール・設計思想・開発方針を集約する。

例（将来像含む）：

```txt
docs/
  architecture.md      # このドキュメント
  development.md       # 開発フロー・ローカル環境構築
  deployment.md        # デプロイ方針
  DDD/
    index.md
    layers/
    modeling/
    rules/
  APP/                 # ランタイム/ログ/認証/エラー等（将来）
  INFRA/               # VPS/ネットワーク/監視等（将来）
  DEV/                 # 開発規約・コーディング規約等（将来）
```

アプリ固有の仕様は **apps/<app>/docs/** に閉じ込める。

### 1.4 infra/

- Docker / config / scripts など「環境構築と運用のテンプレート」を置く。

```txt
infra/
  configs/
    templates/
      apps/
      base/
  docker/
    apps/
    base/
    db/
    reverse-proxy/
  scripts/
    build/
    config/
    deploy/
```

---

## 2. Backend Architecture（共通バックエンド構造）

全ての backend（apps/backend, base/* の backend）は  
**DDD + Clean Architecture（Ports & Adapters 系）の 4 レイヤー構造**を採用する。

- domain
- usecase
- adapter
- infra

詳細ルールは `docs/ddd/` に定義し、本書では位置づけのみ記述する。

### 2.1 Backend ディレクトリ構成（標準）

```txt
apps/<app>/backend/
  cmd/
    api/            # HTTP サーバ起動
  internal/
    domain/           # ドメインモデル（Entity/VO/RepositoryIF/DomainService）
    usecase/          # アプリケーションサービス・ユースケース
    adapter/          # HTTP/gRPC/CLI/Webhook 等の I/O
    infra/            # DB/外部API/ストレージ等の技術詳細
```

backend 以下のレイヤー（domain/usecase/adapter/infra）は
Go の internal 機能で外部モジュールからの import を禁止する。
各サービスは API / gRPC / Message 経由でのみ他サービスと連携するため、
ドメインロジックを外部に漏らさないことを保証する。

base/* の backend も同様の構造を採用する。

### 2.2 レイヤー概要（詳細は docs/ddd/）

- `domain`  
  → ビジネスルール・ユビキタス言語。外部技術は一切知らない。  
  → 詳細：`docs/DDD/layers/domain.md`, `docs/ddd/modeling/*.md`

- `usecase`  
  → ユースケース単位のアプリケーションロジック。  
  → トランザクション境界の管理。  
  → 詳細：`docs/ddd/layers/usecase.md`, `docs/ddd/rules/data-access.md`

- `adapter`  
  → HTTP/gRPC/CLI/Webhook など I/O の境界。  
  → DTO の定義、エラーマッピング、認証情報の抽出。  
  → 詳細：`docs/ddd/layers/adapter.md`

- `infra`  
  → DB 永続化・キャッシュ・外部API・ストレージ・Clock/IDGenerator。  
  → domain/usecase から見えるのは interface のみ。  
  → 詳細：`docs/ddd/layers/infra.md`

### 2.3 依存方向

- adapter / usecase / infra → domain への依存は OK
- usecase → adapter/infra への依存は NG（interface経由）
- infra → usecase/adapter への依存は NG
- domain → 他レイヤーへの依存は NG

**実際の依存関係は `cmd/api/main.go` などの composition 層で解決する。**

---

## 3. Frontend Architecture（Next.js 前提）

各アプリの frontend は Next.js を基本とし、以下のような構造を標準とする（例）：

```txt
apps/<app>/frontend/
  app/ or pages/
  components/
    ui/
    layout/
    domain/
  lib/
    api/
    config/
    hooks/
  public/
  styles/
  env.d.ts       # 型付き環境変数（必要なら）
```

### 3.1 方針

- pages/app ディレクトリ配下は Next.js のルーティングルールに従う。
- `components/` は UI コンポーネントを集約し、ロジックは `lib/` に寄せる。
- API 通信は `lib/api/` に集約し、直接 fetch を散らさない。
- 環境変数の解釈は Next.js の仕組みに従い、`.env.*` は `infra/configs/templates/` のテンプレートと対応させる。

※ Frontend 側のより詳細な規約は将来 `docs/APP/frontend.md` 等で定義する。

---

## 4. apps/ — 各プロダクトアプリ

### 4.1 アプリ構造

```txt
apps/<app-name>/
  backend/
  frontend/
  docs/
    overview.md       # アプリ概要（ビジネス視点）
    requirements.md   # 要件・ユースケース一覧
    development.md    # 開発手順（ローカル環境・起動方法）
    ddd_notes.md      # このアプリ固有の DDD メモ（必要なら）
    DEVLOG/           # 開発ログ（任意）
```

### 4.2 アプリごとのルール

- バックエンド構造は「2. Backend Architecture」に従う。
- DDD のグローバルルールから外れたい場合は **apps/<app>/docs/ddd_notes.md** に理由を明記する。
- アプリ固有の運用・仕様・用語は apps/<app>/docs/ に閉じ込め、  
  `docs/ddd/` や `docs/architecture.md` には影響を与えない。

---

## 5. base/ — 共通基盤サービス

### 5.1 役割

- 認証・メッセージング等、複数アプリから利用される共通サービスを提供する。
- 例：
  - `base/auth`：認証・ユーザー管理
  - `base/message`：メール送信・通知・メッセージング

### 5.2 構造

各 base サービスも基本的には apps/<app>/backend と同じ構造を持つ：

```txt
base/auth/
  backend/
  docs/
base/message/
  backend/
  docs/
```

### 5.3 依存ルール

- `apps` → `base`：依存してよい
- `base` → `apps`：依存禁止
- `base` 同士は、原則として疎結合を保つ（必要に応じて API 経由等）。

---

## 6. infra/ — インフラテンプレート

Infra は、ローカル・ステージング・本番などの環境構築を  
**テンプレートとして標準化するための場所**。

```txt
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
  docker/
    apps/
      makotoclub/
        compose.dev.yml
        compose.local.yml
        compose.prod.yml
    base/
      compose.dev.yml
      compose.local.yml
      compose.prod.yml
    db/
      postgres/compose.yml
      redis/compose.yml
    reverse-proxy/
      caddy/compose.yml
      nginx/compose.yml
      traefik/compose.yml
  scripts/
    build/
    config/
    deploy/
```

### 6.1 configs/templates

- `.env.dist` のテンプレート置き場。
- 環境ごとの差分は実際の `.env` ファイル（リポジトリ外 or 別管理）で扱う。
- LLM に「どの環境変数が必要か」を教えるためのソースとしても使う。

### 6.2 docker

- 各アプリ・サービス・インフラ用の `docker-compose` ファイルを配置。
- apps/base/db/reverse-proxy を分けておくことで、  
  どのスタックが何を起動するのかが明瞭になる。

### 6.3 scripts

- build/config/deploy 系の shell スクリプトを配置。
- CI/CD からも再利用できる形に整える。

---

## 7. docs/ — 全体のルールと DDD

### 7.1 architecture.md（このファイル）

- ルート構造
- apps/base/infra/docs の責務
- backend/frontend のアーキテクチャ
- 依存方向のルール

### 7.2 DDD/

- バックエンドの設計ルール全集。
- `layers/`, `modeling/`, `rules/` に分割済み。

例：

```txt
docs/ddd/
  index.md
  layers/
    overview.md
    domain.md
    usecase.md
    adapter.md
    infra.md
  modeling/
    entity.md
    value-object.md
    aggregate.md
    domain-service.md
    repository.md
  rules/
    data-access.md
```

### 7.3 今後の docs 拡張

将来的に、以下のような構造を想定する：

```txt
docs/
  APP/
    runtime/
      index.md         # 認証/認可/ログ/メトリクス/エラー方針 など
  INFRA/
    vps/
    network/
    monitoring/
  DEV/
    coding-rules.md
    git-flow.md
    testing-strategy.md
```

---

## 8. 開発フロー（概要）

最低限の共通フローだけここに書き、  
細かい手順は `docs/development.md` や apps/<app>/docs/development.md に委ねる。

1. `git clone` して `roots/` を取得
2. `infra/configs/templates/` から `.env.dist` を参考に、環境ごとの `.env` を作成
3. ローカル開発：
   - 対象アプリの `infra/docker/apps/<app>/compose.local.yml` を起動
   - `apps/<app>/backend` と `apps/<app>/frontend` を起動
4. 本番：
   - `infra/docker/apps/<app>/compose.prod.yml` をベースに VPS/サーバへデプロイ
   - base サービスも同様に `infra/docker/base/` から起動

---

## 9. 命名・ルールまとめ（抜粋）

- ディレクトリ名は **小文字スネークケース or 単語連結**（`makotoclub`, `tink` 等）
- docs のファイル名は **小文字 + スネーク/ハイフン**（例：`architecture.md`, `development.md`）
- backend のレイヤーディレクトリ名は固定：`domain`, `usecase`, `adapter`, `infra`
- VO ファイル名は `vo_*.go` に統一（例：`vo_name.go`, `vo_email.go`）
- Aggregate 単位のディレクトリは単数形：`user`, `store`, `survey`

詳細な設計ルールは `docs/DDD/` 側に譲る。

---

## 10. このファイルの運用ルール

- **構造を変えたら先に architecture.md を更新する。コードは後。**
- DDD や APP/INFRA docs が増えたら、ここからリンクを張る。
- LLM に設計を理解させるときは、  
  必ずこの `docs/architecture.md` と `docs/DDD/index.md` をセットで渡す。

このファイルは Project Roots の「地図」そのものであり、  
迷子になったときに戻ってくる場所である。