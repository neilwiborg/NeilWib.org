#!/usr/bin/env bash
set -euo pipefail

if ! command -v corepack >/dev/null 2>&1; then
  echo "corepack not found. Install Node.js (v16.13+; recommended: nvm install && nvm use) and retry."
  exit 1
fi

PACKAGE_MANAGER="$(node -p "require('./package.json').packageManager || ''")"
if [[ -z "${PACKAGE_MANAGER}" ]]; then
  echo "No packageManager field found in package.json."
  exit 1
fi

echo "Enabling Corepack..."
corepack enable

echo "Activating ${PACKAGE_MANAGER}..."
corepack prepare "${PACKAGE_MANAGER}" --activate

echo "Done. Next step: pnpm install"
