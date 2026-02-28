#!/bin/bash
# ─────────────────────────────────────────────────────────────────────────────
# setup-server.sh — Ejecutar UNA SOLA VEZ en el servidor Hetzner recién creado
# Uso: ssh root@IP 'bash -s' < scripts/setup-server.sh
# ─────────────────────────────────────────────────────────────────────────────
set -e

echo "▶ Actualizando paquetes..."
apt-get update -qq && apt-get upgrade -y -qq

echo "▶ Instalando Docker..."
curl -fsSL https://get.docker.com | sh

echo "▶ Instalando Git..."
apt-get install -y -qq git

echo "▶ Creando usuario deploy (sin root)..."
if ! id "deploy" &>/dev/null; then
  useradd -m -s /bin/bash deploy
  usermod -aG docker deploy
fi

echo "▶ Configurando firewall básico (ufw)..."
apt-get install -y -qq ufw
ufw allow OpenSSH
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

echo "
✅ Servidor listo.

Pasos siguientes:
  1. Copia tu clave SSH al usuario deploy:
       ssh-copy-id deploy@$(hostname -I | awk '{print $1}')

  2. Clona el repositorio:
       ssh deploy@$(hostname -I | awk '{print $1}')
       git clone https://github.com/TU_USUARIO/fundacion.git /home/deploy/fundacion

  3. Ejecuta el despliegue inicial:
       cd /home/deploy/fundacion && bash scripts/deploy.sh
"
