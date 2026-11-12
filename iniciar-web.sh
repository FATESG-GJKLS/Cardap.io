#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/mobile"
command -v node >/dev/null || { echo 'Erro: instale Node.js.' >&2; exit 1; }
command -v npm >/dev/null || { echo 'Erro: instale npm.' >&2; exit 1; }
if [ ! -d node_modules ]; then
  echo 'Instalando dependencias do aplicativo Expo...'
  npm install
fi
echo 'Iniciando Expo Web em http://localhost:8081 ...'
exec npm run web
