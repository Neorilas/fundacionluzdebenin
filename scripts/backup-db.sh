#!/bin/bash
# backup-db.sh — Copia de seguridad diaria de la base de datos SQLite
#
# Uso manual:    bash scripts/backup-db.sh
# Cron diario:   0 3 * * * /root/fundacion/scripts/backup-db.sh >> /var/log/fundacion-backup.log 2>&1
#
# Los backups se guardan en /root/fundacion-backups/ y se conservan los ultimos 30 dias.

set -e

BACKUP_DIR="/root/fundacion-backups"
CONTAINER="fundacion-backend-1"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/prod_$TIMESTAMP.db"
KEEP_DAYS=30

mkdir -p "$BACKUP_DIR"

# Comprobar que el contenedor esta corriendo
if ! docker ps --format '{{.Names}}' | grep -q "^${CONTAINER}$"; then
  echo "[$(date)] ERROR: El contenedor $CONTAINER no esta corriendo"
  exit 1
fi

# Copiar la BD desde el volumen Docker
docker cp "$CONTAINER:/data/prod.db" "$BACKUP_FILE"

SIZE=$(du -sh "$BACKUP_FILE" | cut -f1)
echo "[$(date)] Backup OK: $BACKUP_FILE ($SIZE)"

# Eliminar backups mas antiguos de KEEP_DAYS dias
find "$BACKUP_DIR" -name "prod_*.db" -mtime +$KEEP_DAYS -delete
REMAINING=$(find "$BACKUP_DIR" -name "prod_*.db" | wc -l)
echo "[$(date)] Backups conservados: $REMAINING"
