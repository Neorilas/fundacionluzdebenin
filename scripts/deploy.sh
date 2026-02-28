#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# deploy.sh — Despliegue inicial y actualizaciones
# Ejecutar en el servidor: bash scripts/deploy.sh
# ─────────────────────────────────────────────────────────────────────────────
set -e

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"

echo "📦 Fundación Luz de Benín — Despliegue"
echo "────────────────────────────────────────"

# ── 1. Crear .env si no existe ──────────────────────────────────────────────
if [ ! -f .env ]; then
  echo "⚙️  Creando archivo .env..."
  cp .env.production .env

  # Pedir JWT_SECRET si no está configurado
  if grep -q "cambia-esto" .env; then
    JWT=$(openssl rand -hex 32)
    sed -i "s/cambia-esto-por-un-secreto-largo-y-aleatorio/$JWT/" .env
    echo "🔑 JWT_SECRET generado automáticamente."
  fi

  echo ""
  echo "⚠️  Edita .env y pon tu dominio real antes de continuar:"
  echo "    nano .env"
  echo ""
  read -p "Pulsa ENTER cuando hayas guardado el .env..."
fi

# ── 2. Cargar variables ──────────────────────────────────────────────────────
export $(grep -v '^#' .env | xargs)

echo "🌐 Dominio: $DOMAIN"

# ── 3. Pull de cambios (si hay repo git) ────────────────────────────────────
if git rev-parse --git-dir > /dev/null 2>&1; then
  echo "🔄 Actualizando código..."
  git pull --ff-only
fi

# ── 4. Construir y levantar ──────────────────────────────────────────────────
echo "🐳 Construyendo imágenes Docker..."
docker compose build --parallel

echo "🚀 Levantando servicios..."
docker compose up -d

# ── 5. Esperar a que el backend esté listo ───────────────────────────────────
echo "⏳ Esperando al backend..."
for i in $(seq 1 30); do
  if docker compose exec -T backend wget -qO- http://localhost:3001/api/health > /dev/null 2>&1; then
    break
  fi
  sleep 2
done

# ── 6. Seed inicial (solo si la BD está vacía) ───────────────────────────────
ADMIN_COUNT=$(docker compose exec -T backend \
  sh -c 'node -e "
    const { PrismaClient } = require(\"@prisma/client\");
    const p = new PrismaClient();
    p.adminUser.count().then(n => { console.log(n); p.\$disconnect(); });
  "' 2>/dev/null || echo "0")

if [ "$ADMIN_COUNT" = "0" ]; then
  echo "🌱 Ejecutando seed inicial..."
  docker compose exec -T backend \
    sh -c 'node -e "
      process.env.DATABASE_URL = process.env.DATABASE_URL || \"file:/data/prod.db\";
    "' || true
  # Copiar y ejecutar seed compilado
  docker compose exec -T backend \
    node -e "
      const bcrypt = require('bcryptjs');
      const { PrismaClient } = require('@prisma/client');
      const p = new PrismaClient();
      bcrypt.hash('admin123', 10).then(hash =>
        p.adminUser.upsert({
          where: { email: 'admin@fundacionluzdebenin.org' },
          update: {},
          create: { email: 'admin@fundacionluzdebenin.org', passwordHash: hash, name: 'Administrador' }
        })
      ).then(() => { console.log('Admin creado'); p.\$disconnect(); });
    " 2>/dev/null || echo "ℹ️  Seed manual: accede al admin y cambia la contraseña."
fi

# ── 7. Resumen ───────────────────────────────────────────────────────────────
echo ""
echo "✅ Despliegue completado"
echo "────────────────────────────────────────"
echo "🌐 Web:   https://$DOMAIN"
echo "🔐 Admin: https://$DOMAIN/admin/"
echo "⚙️  API:   https://$DOMAIN/api/health"
echo ""
echo "Credenciales admin iniciales:"
echo "  Email:      admin@fundacionluzdebenin.org"
echo "  Contraseña: admin123  ← ¡CÁMBIALA YA!"
echo ""
echo "Ver logs en tiempo real:"
echo "  docker compose logs -f"
