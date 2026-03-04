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

# Parar contenedores existentes por nombre (forzado)
docker stop fundacion-backend-1 fundacion-frontend-1 fundacion-caddy-1 2>/dev/null || true
docker rm -f fundacion-backend-1 fundacion-frontend-1 fundacion-caddy-1 2>/dev/null || true
docker network rm fundacion_default 2>/dev/null || true

# Levantar (--remove-orphans limpia contenedores huérfanos de versiones anteriores)
docker compose up -d --remove-orphans

echo "✅ Actualización completada"
docker compose ps
