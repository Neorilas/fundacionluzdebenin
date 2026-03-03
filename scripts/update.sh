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

# Limpiar contenedores huérfanos y reiniciar
docker compose down --remove-orphans
docker compose up -d

echo "✅ Actualización completada"
docker compose ps
