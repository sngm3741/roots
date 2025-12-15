#!/usr/bin/env bash
set -euo pipefail

# sops + age を使って infra/configs 配下の平文 .env / .yaml / .yml を
# .enc.env / .enc.yaml に暗号化するユーティリティ。
# - 平文は gitignore 前提、暗号化版だけコミットする運用を想定。
# - age 秘密鍵は SOPS_AGE_KEY で渡すか、~/.config/sops/age/keys.txt / ~/.age/key.txt に置くこと。

# このスクリプトは infra/scripts/config に置かれているため、3階層上がリポジトリルート。
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd)"
SOPS_CONFIG="${SOPS_CONFIG:-${REPO_ROOT}/.sops.yaml}"

if [[ ! -f "$SOPS_CONFIG" ]]; then
  echo "sopsの設定ファイルが見つかりません: $SOPS_CONFIG" >&2
  exit 1
fi

encrypt_file() {
  local src="$1"
  local dst="$2"
  mkdir -p "$(dirname "$dst")"
  sops --config "$SOPS_CONFIG" --encrypt --output "$dst" "$src"
  echo "暗号化しました: $src -> $dst"
}

# .env -> .enc.env（infra/configs 配下の全ての .env を対象。templates 配下は除外）
while IFS= read -r -d '' f; do
  case "$f" in
    *.enc.env) continue ;;
  esac
  if [[ "$f" == *"/templates/"* ]]; then
    continue
  fi
  if [[ ! -s "$f" ]]; then
    echo "空ファイルのためスキップ: $f" >&2
    continue
  fi
  encrypt_file "$f" "${f%.env}.enc.env"
done < <(find "${REPO_ROOT}/infra/configs" -name "*.env" -type f -print0)

# tenants/*.yaml|*.yml -> *.enc.yaml
while IFS= read -r -d '' f; do
  case "$f" in
    *.enc.yaml|*.enc.yml) continue ;;
  esac
  if [[ "$f" == *"/templates/"* ]]; then
    continue
  fi
  if [[ ! -s "$f" ]]; then
    echo "空ファイルのためスキップ: $f" >&2
    continue
  fi
  # 拡張子を .enc.yaml に統一
  base="${f%.*}"
  encrypt_file "$f" "${base}.enc.yaml"
done < <(find "${REPO_ROOT}/infra/configs" -path "*/base/*/tenants/*" \( -name "*.yaml" -o -name "*.yml" \) -type f -print0)

echo "done."
echo "完了しました。"
