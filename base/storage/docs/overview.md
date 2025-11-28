# base/storage サービス概要

- 旧 upload-service を新アーキテクチャで再構築したストレージ基盤。
- HTTPフレームワークは Go の chi を使用し、エンドポイント例:
  - `GET /healthz`
  - `POST /uploads` (multipart/form-data, fileフィールド)
- ストレージは S3/R2 互換エンドポイントを想定し、バケット/エンドポイント/公開URLは環境変数で指定する。
- Web/API は単一バイナリ（`cmd/api`）で起動し、必要に応じて S3 クライアントを差し替え可能。
- テストを書く/修正する際は必ず `docs/test_strategy.md` を参照。
