#!/usr/bin/env zsh
set -euo pipefail

# macOS用 起動シェル（IP起動）
# - .env.local の VITE_PUBLIC_VIEWER_URL からIP/ポートを取得（なければ自動検出+5173）
# - --host と --port を明示指定してLAN共有
# - /official を自動オープン
# - 共有URLを出力・クリップボードにコピー

ROOT_DIR=$(cd "$(dirname "$0")/.." && pwd)

# VITE_EDIT_PASSWORD（任意）をauth.jsonから設定
CONFIG_JSON="$ROOT_DIR/src/config/auth.json"
if [[ -f "$CONFIG_JSON" ]]; then
  EDIT_PASSWORD=$(node -e "const fs=require('fs');const d=JSON.parse(fs.readFileSync(process.argv[1],'utf8'));console.log(d.editPassword||'')" "$CONFIG_JSON")
  if [[ -n "$EDIT_PASSWORD" ]]; then
    export VITE_EDIT_PASSWORD="$EDIT_PASSWORD"
  fi
fi

# .env.local からURL取得
ENV_FILE="$ROOT_DIR/.env.local"
URL_VALUE=""
if [[ -f "$ENV_FILE" ]]; then
  URL_LINE=$(grep -E '^VITE_PUBLIC_VIEWER_URL=' "$ENV_FILE" | tail -n1 || true)
  URL_VALUE=${URL_LINE#VITE_PUBLIC_VIEWER_URL=}
  URL_VALUE=${URL_VALUE//\"/}
fi

ENV_HOST=""
ENV_PORT=""
if [[ -n "$URL_VALUE" ]]; then
  ENV_HOST=$(node -e "const u=new URL(process.argv[1]);console.log(u.hostname)" "$URL_VALUE")
  ENV_PORT=$(node -e "const u=new URL(process.argv[1]);console.log(u.port||'5173')" "$URL_VALUE")
fi

get_lan_ip() {
  local ip=""
  ip=$(ipconfig getifaddr en0 2>/dev/null || true)
  [[ -z "${ip:-}" ]] && ip=$(ipconfig getifaddr en1 2>/dev/null || true)
  [[ -z "${ip:-}" ]] && ip=$(ifconfig | awk '/inet / && $2 !~ /^127\./ && $2 !~ /^169\.254\./ {print $2; exit}')
  echo "$ip"
}

# 指定ホストがローカルNICに存在するかチェック
host_available() {
  local h="$1"
  if [[ -z "$h" ]]; then
    return 1
  fi
  ifconfig | awk '/inet /{print $2}' | grep -Fx "$h" >/dev/null 2>&1
}

LAN_IP=$(get_lan_ip)
HOST_TO_USE="${ENV_HOST}"
if [[ -z "${HOST_TO_USE:-}" || "${HOST_TO_USE}" == "localhost" || ! $(host_available "$HOST_TO_USE") ]]; then
  HOST_TO_USE="${LAN_IP:-0.0.0.0}"
fi
PORT_TO_USE="${ENV_PORT:-${PORT:-5173}}"

NETWORK_URL="http://$HOST_TO_USE:$PORT_TO_USE/"
OFFICIAL_URL="${NETWORK_URL}official"

# クライアント向け参照URLを環境へ
export VITE_PUBLIC_VIEWER_URL="$NETWORK_URL"

echo "[INFO] 起動ホスト: $HOST_TO_USE"
echo "[INFO] 起動ポート: $PORT_TO_USE"
echo "[INFO] ネットワークURL: $NETWORK_URL"
echo "[INFO] /official: $OFFICIAL_URL"

if command -v pbcopy >/dev/null 2>&1; then
  echo -n "$OFFICIAL_URL" | pbcopy
  echo "[INFO] 共有URL(/official)をクリップボードにコピーしました。"
fi

cd "$ROOT_DIR"

if command -v npm >/dev/null 2>&1; then
  echo "[INFO] npmで起動: $OFFICIAL_URL"
  npm run dev -- --host "$HOST_TO_USE" --port "$PORT_TO_USE" --strictPort --open /official
elif command -v pnpm >/dev/null 2>&1; then
  echo "[INFO] pnpmで起動: $OFFICIAL_URL"
  pnpm run dev -- --host "$HOST_TO_USE" --port "$PORT_TO_USE" --strictPort --open /official
elif command -v yarn >/dev/null 2>&1; then
  echo "[INFO] yarnで起動: $OFFICIAL_URL"
  yarn dev -- --host "$HOST_TO_USE" --port "$PORT_TO_USE" --strictPort --open /official
else
  echo "[ERROR] npm / pnpm / yarn が見つかりません。" >&2
  exit 1
fi