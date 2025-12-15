# base/auth サービス概要

- HTTPフレームワークは Go の chi を使用する。
- 認証プロバイダ（LINE/Twitter/Discord など）は **現状単一バイナリで混在** させる方針。
  - メリット: 共通ミドルウェア/ヘルスチェックを一箇所で管理、デプロイを一本化できる。
  - リスク: 一社の障害やレートリミットが他プロバイダに波及、envが肥大化し事故リスク増。
  - 運用指針: config/handler/usecase/infra をプロバイダごとに明確に分離し、後でプロバイダ単位のバイナリ/コンテナに分割できるようにしておく（共通コードは内部ライブラリ化）。
  - 負荷やSLO要件が厳しくなった段階で、プロバイダごとのサービス分割を検討する。
- マルチテナント方針:
  - Hostの先頭ラベルからテナントIDを解決し（例: `tenantA.auth.example.com` → `tenantA`）、`AUTH_TENANT_CONFIG_PATH` で指すディレクトリ内の YAML (`infra/configs/templates/base/auth/tenants/example.yaml`) からテナント別の origin / redirect / credentials を読み込む。
  - env には HTTPリスンアドレスと YAML ディレクトリパスのみを持たせ、テナント固有値は YAML に集約する。
  - 依存が増えても `internal/adapter/http/handler.WithTenant` とテナントリゾルバを通して DI することで、プロバイダ分割や将来のファイル再ロードに備える。
- 逆プロキシ前提:
  - ローカルでは `infra/configs/local/reverse-proxy/conf.d/base.conf` の nginx が `*.auth.localhost` を `auth:8080` に転送し、Hostヘッダを保持したまま渡す。これによりサブドメイン=テナントの解決を本番と同じ手順で再現する。
  - 本番もサブドメインでテナントを識別するDNS/リバプロ設定が前提。Hostヘッダを改変しないことが必須。
