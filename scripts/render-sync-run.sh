#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
printf 'Render API key: '
read -rs render_key
echo

export RENDER_API_KEY="$render_key"
DEPLOY_MODE=build_and_deploy ./scripts/render-sync-env.sh
