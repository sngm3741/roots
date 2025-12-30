### プロジェクト一括管理用。

## Make の使い方

`make` だけでヘルプを表示します。

```
make
```

よく使うターゲット:

- `make test` 全体テスト（auth/message/storage）
- `make test-auth` auth のテスト
- `make test-message` message のテスト
- `make test-storage` storage のテスト
- `make local-storage-up` Storage-only 起動（minio + storage）
- `make local-storage-down` Storage-only 停止
- `make local-message-up` Message-only 起動（nats + message-ingress + message-worker）
- `make local-message-down` Message-only 停止
- `make encrypt-configs` infra/configs の .env/.yaml を暗号化
- `make decrypt-configs` infra/configs の .enc を復号
- `make makotoclub-frontend-preview` makotoclub frontend preview
- `make makotoclub-admin-preview` makotoclub admin preview
- `make makotoclub-d1-backup` MakotoClub D1 バックアップ（本番）
