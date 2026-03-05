#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# switch-domain.sh — Cambia de subdominio a dominio definitivo (o viceversa)
#
# Uso:
#   bash scripts/switch-domain.sh                        # usa el DOMAIN del .env
#   bash scripts/switch-domain.sh fundacionluzdebenin.org  # cambia y aplica
# ─────────────────────────────────────────────────────────────────────────────
set -e

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$REPO_DIR"

# ── Si se pasa un dominio como argumento, actualizarlo en .env ───────────────
if [ -n "$1" ]; then
  NEW_DOMAIN="$1"

  if [ ! -f .env ]; then
    echo "❌ No existe .env. Ejecuta primero: bash scripts/deploy.sh"
    exit 1
  fi

  # Actualizar DOMAIN en .env
  sed -i "s|^DOMAIN=.*|DOMAIN=$NEW_DOMAIN|" .env
  echo "✅ DOMAIN actualizado a: $NEW_DOMAIN"
fi

# ── Leer dominio actual ───────────────────────────────────────────────────────
export $(grep -v '^#' .env | xargs)

if [ -z "$DOMAIN" ]; then
  echo "❌ DOMAIN no está definido en .env"
  exit 1
fi

echo ""
echo "🌐 Aplicando dominio: $DOMAIN"
echo "──────────────────────────────────"

# ── Reconstruir frontend con el nuevo dominio (baked en el JS) ───────────────
echo "🔨 Reconstruyendo frontend con NEXT_PUBLIC_API_URL=https://$DOMAIN..."
docker compose build --no-cache frontend

# ── Parar y eliminar todos los contenedores (evita conflictos de nombres) ────
echo "🛑 Deteniendo contenedores..."
docker ps -aq --filter 'name=fundacion' | xargs -r docker rm -f
docker network rm fundacion_default 2>/dev/null || true

# ── Levantar todo con el nuevo dominio ───────────────────────────────────────
echo "🚀 Levantando servicios con nuevo dominio..."
docker compose up -d --remove-orphans

# ── Esperar a que Caddy obtenga el certificado ───────────────────────────────
echo "⏳ Esperando certificado SSL para $DOMAIN..."
sleep 10

# Verificar
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "https://$DOMAIN/api/health" 2>/dev/null || echo "000")

echo ""
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Todo funcionando en https://$DOMAIN"
else
  echo "⏳ El DNS puede tardar unos minutos en propagar."
  echo "   Comprueba manualmente: https://$DOMAIN"
  echo "   Ver logs de Caddy: docker compose logs caddy"
fi

echo ""
echo "URLs activas:"
echo "  🌐 Web:   https://$DOMAIN"
echo "  🔐 Admin: https://$DOMAIN/admin/"
echo "  ⚙️  API:   https://$DOMAIN/api/health"
