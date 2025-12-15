httpのフレームワークはgoのchiを使用する

# base/message サービス概要

- HTTPフレームワークは Go の chi を使用する。
- Phase3 では messenger-line / messenger-discord の再構築を予定。
  - 現段階では単一バイナリで混在させる方針（共通ミドルウェア/ヘルスチェックを共有）。
  - リスク: 1プロバイダの障害が他に波及、envが膨らむ。責務はプロバイダごとに分離し、必要なら将来プロバイダ別バイナリへ分割できる設計を保つ。
  - 旧実装は `__before/base-services/messenger-service/*` にある。
  - Webhook/API と Worker は別エントリポイント（例: `cmd/webhook`, `cmd/worker`）に分割し、NATS等で疎結合を維持する方針。Dockerも用途ごとに分ける。
  - 外部送信API(ingress)も `cmd/ingress` として分離し、宛先に応じてNATS subjectへpublishする。
- マルチテナント方針:
  - Host先頭ラベルでテナントIDを解決し、`MESSAGE_TENANT_CONFIG_PATH` で指すディレクトリ配下の YAML (`infra/configs/templates/base/message/tenants/example.yaml`) から NATS URL / subject / Line token / Discord webhook などを取得する。
  - ingress/webhook はテナントごとに NATS publisher を引き当てて publish、worker はテナントごとに NATS購読を張り credentials を切り替える。NATS URL が同じ場合はコネクションをプール共有する。
  - env には HTTPアドレスと YAML パス程度のみを保持し、テナント固有値は YAML に集約する。
- 逆プロキシ (ローカル):
  - `infra/configs/local/reverse-proxy/conf.d/base.conf` で `*.auth.localhost` / `*.message.localhost` / `*.webhook.localhost` / `storage.localhost` を nginx で振り分ける。
  - `(?<tenant>[^.]+)` をサブドメイン先頭から抜き出し、`Host` ヘッダをそのまま backend に渡すことで、ingress/webhook/auth が Host からテナントIDを判定できるようにしている。
  - 実運用でもサブドメイン=テナントのDNS設定が前提。ローカルは compose の nginx を経由して本番と同じ解決手順を再現する。
