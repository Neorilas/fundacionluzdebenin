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

# Restart con zero-downtime (Caddy sigue funcionando)
docker compose up -d --no-deps backend
sleep 5
docker compose up -d --no-deps frontend

echo "✅ Actualización completada"
docker compose ps
