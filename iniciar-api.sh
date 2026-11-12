#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/api"
command -v java >/dev/null || { echo 'Erro: instale Java JDK 17+.' >&2; exit 1; }
command -v mvn >/dev/null || { echo 'Erro: instale Apache Maven 3.9+.' >&2; exit 1; }
mkdir -p data
echo 'Iniciando a API Caradap.io em http://localhost:8080 ...'
exec mvn spring-boot:run
