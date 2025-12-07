# Config暗号化（sops + age）

- infra/configs 配下の平文 `.env` とテナントYAML（`tenants/*.yaml`）は gitignore。暗号化版だけコミットする。
- 暗号化版の作成は `make encrypt-configs` で一括。空ファイルは「空ファイルのためスキップ」と日本語ログを出して処理しない。
- 復号は例: `sops -d infra/configs/local/base/storage/.enc.env > infra/configs/local/base/storage/.env`。一括復号は `make decrypt-configs` で `.enc.env` / `.enc.yaml` を上書き（必要ならバックアップ推奨）。
- age秘密鍵は `SOPS_AGE_KEY` で渡すか `~/.age/key.txt` / `~/.config/sops/age/keys.txt` に置く。
- 秘匿値が入るファイル（平文）は引き続き gitignore。暗号化版のみをコミットする。
