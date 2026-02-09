# D1 本番スナップショット（読み取り専用）

- 取得日時 (UTC): 2026-02-09T04:18:38Z
- DB: `makotoclub`
- 取得方法: `wrangler d1 execute --remote --json`（SELECTのみ）
- 本番DBへの更新: 実施していない

## ファイル構成

- `table_names.txt`: エクスポート対象テーブル一覧
- `tables/*.json`: テーブル単位の生データ
- `database_full.json`: 全テーブルを1ファイルに統合したJSON
- `url_enrichment/stores_url_worklist.json`: 店舗URL付与作業用JSON
- `url_enrichment/stores_url_worklist_unresolved.json`: URL未確定店舗のみ
- `url_enrichment/stores_url_worklist_resolved_from_db.json`: 既存URLが入っていた店舗のみ

## URL付与ワークリストについて

- `officialUrlCandidate` が `null` の店舗は未確定。
- 現在は DB既存値の反映のみ。未確定の自動補完は未実施。
