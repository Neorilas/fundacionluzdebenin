#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# update.sh — Actualizar la aplicación con cero downtime
# Ejecutar en el servidor: bash scripts/update.sh
# ─────────────────────────────────────────────────────────────────────────────
set -e

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"

echo "🔄 Actualizando Fundación Luz de Benín..."

# Pull
git pull --ff-only

# Rebuild solo los servicios que hayan cambiado
docker compose build --parallel

# Parar y eliminar contenedores (forzado si hace falta)
docker compose down --remove-orphans 2>/dev/null || true
docker ps -a --filter "name=fundacion" --format "{{.Names}}" | xargs -r docker rm -f 2>/dev/null || true
docker network rm fundacion_default 2>/dev/null || true

# Levantar
docker compose up -d

echo "✅ Actualización completada"
docker compose ps
