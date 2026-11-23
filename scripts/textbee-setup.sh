#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
printf 'TextBee API key: '
read -rs api_key
echo
api_key=$(printf '%s' "$api_key" | tr -d '[:space:]')
echo "Key length: ${#api_key}"

code=$(curl -sS -m 15 -o /dev/null -w '%{http_code}' https://api.textbee.dev/api/v1/gateway/stats -H "x-api-key: $api_key")
echo "HTTP $code"
if [[ "$code" != "200" ]]; then
  echo "Key not saved. Check the key and try again."
  exit 1
fi

python3 - "$api_key" <<'PY'
import sys
from pathlib import Path

key = sys.argv[1]
p = Path('.env')
lines = p.read_text().splitlines()
for i, line in enumerate(lines):
    if line.startswith('TEXTBEE_API_KEY='):
        lines[i] = 'TEXTBEE_API_KEY=' + key
        break
else:
    lines.append('TEXTBEE_API_KEY=' + key)
p.write_text('\n'.join(lines) + '\n')
PY

echo 'Key saved to .env'
