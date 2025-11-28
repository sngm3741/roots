httpのフレームワークはgoのchiを使用する

# base/message サービス概要

- HTTPフレームワークは Go の chi を使用する。
- Phase3 では messenger-line / messenger-discord の再構築を予定。
  - 現段階では単一バイナリで混在させる方針（共通ミドルウェア/ヘルスチェックを共有）。
  - リスク: 1プロバイダの障害が他に波及、envが膨らむ。責務はプロバイダごとに分離し、必要なら将来プロバイダ別バイナリへ分割できる設計を保つ。
  - 旧実装は `__before/base-services/messenger-service/*` にある。
  - Webhook/API と Worker は別エントリポイント（例: `cmd/webhook`, `cmd/worker`）に分割し、NATS等で疎結合を維持する方針。Dockerも用途ごとに分ける。
  - 外部送信API(ingress)も `cmd/ingress` として分離し、宛先に応じてNATS subjectへpublishする。
