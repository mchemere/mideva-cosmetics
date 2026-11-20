#!/usr/bin/env bash
set -euo pipefail

service_id="${RENDER_SERVICE_ID:-srv-dbul1gmk1f9s73ajp5q0}"
api_key="${RENDER_API_KEY:?set RENDER_API_KEY and rerun}"
deploy_mode="${DEPLOY_MODE:-deploy_only}"
health_url="${HEALTH_URL:-https://gifted-hands-api.onrender.com/api/health}"

if [[ -f .env ]]; then
  while IFS= read -r line || [[ -n "$line" ]]; do
    [[ -z "$line" || "$line" == \#* ]] && continue
    key="${line%%=*}"
    key="${key#export }"
    key="${key//[[:space:]]/}"
    [[ -z "$key" || "$key" != [A-Za-z_]* ]] && continue
    [[ -v "$key" ]] && continue
    value="${line#*=}"
    if [[ "$value" == \"*\" || "$value" == \'*\' ]]; then
      value="${value:1:-1}"
    fi
    export "$key=$value"
  done < .env
fi

keys=(GMAIL_CLIENT_ID GMAIL_CLIENT_SECRET GMAIL_REFRESH_TOKEN NOTIFY_EMAIL SMTP_FROM SMS_PROVIDER NOTIFY_PHONE TEXTBEE_API_KEY TEXTBEE_DEVICE_ID TEXTBEE_BASE_URL)
if [[ -n "${EXTRA_KEYS:-}" ]]; then
  read -r -a extra <<< "$EXTRA_KEYS"
  keys+=("${extra[@]}")
fi

for key in "${keys[@]}"; do
  value="${!key-}"
  if [[ -z "$value" ]]; then
    echo "skip $key (empty)" >&2
    continue
  fi
  payload=$(python3 -c 'import json,sys; print(json.dumps({"value": sys.argv[1]}))' "$value")
  curl -fsS -o /dev/null -X PUT \
    "https://api.render.com/v1/services/$service_id/env-vars/$key" \
    -H "Authorization: Bearer $api_key" \
    -H "Accept: application/json" \
    -H "Content-Type: application/json" \
    --data "$payload"
  echo "set $key"
done

deploy_payload=$(python3 -c 'import json,sys; print(json.dumps({"deployMode": sys.argv[1]}))' "$deploy_mode")
curl -fsS -o /dev/null -X POST \
  "https://api.render.com/v1/services/$service_id/deploys" \
  -H "Authorization: Bearer $api_key" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  --data "$deploy_payload"
echo "deploy triggered"

for _ in $(seq 1 36); do
  health=$(curl -s --max-time 60 "$health_url" || true)
  if python3 -c 'import json,sys; sys.exit(0 if json.loads(sys.stdin.read()).get("status") == "ok" else 1)' <<< "$health"; then
    echo "health: ok"
    echo "$health"
    exit 0
  fi
  sleep 5
done

echo "health not ok; check Render logs" >&2
exit 1
