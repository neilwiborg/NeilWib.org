#!/usr/bin/env bash
set -euo pipefail

if ! command -v corepack >/dev/null 2>&1; then
  echo "Corepack is not bundled with Node.js 25 and newer; installing it with npm..."
  npm install --global corepack@latest
fi

PACKAGE_MANAGER="$(node -p "require('./package.json').packageManager || ''")"
if [[ -z "${PACKAGE_MANAGER}" ]]; then
  echo "No packageManager field found in package.json."
  exit 1
fi

echo "Enabling the pnpm command..."
corepack enable pnpm

echo "Installing the project-pinned package manager (${PACKAGE_MANAGER})..."
corepack install

echo "Done. Next step: pnpm install"
