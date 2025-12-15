#!/usr/bin/env bash
set -euo pipefail

# sops + age を使って infra/configs 配下の .enc.env / .enc.yaml を
# 平文 .env / .yaml に復号するユーティリティ。
# - 平文は gitignore 前提。上書きするので必要なら事前にバックアップを取ること。
# - age 秘密鍵は SOPS_AGE_KEY で渡すか、~/.config/sops/age/keys.txt / ~/.age/key.txt に置くこと。

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
SOPS_CONFIG="${SOPS_CONFIG:-${REPO_ROOT}/.sops.yaml}"

if [[ ! -f "$SOPS_CONFIG" ]]; then
  echo "sopsの設定ファイルが見つかりません: $SOPS_CONFIG" >&2
  exit 1
fi

decrypt_file() {
  local src="$1"
  local dst="$2"
  mkdir -p "$(dirname "$dst")"
  sops --config "$SOPS_CONFIG" --decrypt --output "$dst" "$src"
  echo "復号しました: $src -> $dst"
}

# .enc.env -> .env（infra/configs 配下の全ての .enc.env を対象）
while IFS= read -r -d '' f; do
  dst="${f%.enc.env}.env"
  decrypt_file "$f" "$dst"
done < <(find "${REPO_ROOT}/infra/configs" -name "*.enc.env" -type f -print0)

# .enc.yaml/.enc.yml -> .yaml
while IFS= read -r -d '' f; do
  # 拡張子を .yaml に揃える（元が .yml でも .yaml にする）
  base="${f%.enc.yaml}"
  base="${base%.enc.yml}"
  decrypt_file "$f" "${base}.yaml"
done < <(find "${REPO_ROOT}/infra/configs" -path "*/base/*/tenants/*.enc.yaml" -o -path "*/base/*/tenants/*.enc.yml" -type f -print0)

echo "完了しました。"
