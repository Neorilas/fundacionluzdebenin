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

# Eliminar todos los contenedores del proyecto (evita conflictos de nombres)
docker ps -aq --filter 'name=fundacion' | xargs -r docker rm -f
docker network rm fundacion_default 2>/dev/null || true

# Levantar (--remove-orphans limpia contenedores huérfanos de versiones anteriores)
docker compose up -d --remove-orphans

# Migraciones puntuales (idempotentes: omite posts ya en HTML)
echo "🔀 Ejecutando migración MD→HTML en posts del blog..."
docker compose exec -T backend node scripts/migrate-md-to-html.cjs || true

echo "✅ Actualización completada"
docker compose ps
