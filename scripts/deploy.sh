#!/usr/bin/env bash
# Деплой «Техник · Котлас» на Timeweb (5.42.116.170) — по образцу globus-kotlas-site/scripts/deploy.sh.
# Идемпотентно: первый запуск создаёт пользователя, БД, systemd, nginx; дальше — только обновление кода.
#
#   chmod +x scripts/deploy.sh && ./scripts/deploy.sh
#
# Перед первым запуском на сервере должен лежать /var/www/tehnik/.env.local (см. .env.local.example);
# пароль роли БД скрипт печатает при создании — подставьте его в DATABASE_URL.
set -euo pipefail

SERVER="root@5.42.116.170"
SSH_KEY="${SSH_KEY:-$HOME/Documents/aidamaster/.deploy/timeweb_key}"
REMOTE_DIR="/var/www/tehnik"
SYSTEM_USER="tehnik"
DB_NAME="tehnik_db"
DB_USER="tehnik_app"
PORT=3070
FALLBACK_DOMAIN="tehnik.5-42-116-170.sslip.io"

[ -f "$SSH_KEY" ] || { echo "Нет ключа $SSH_KEY"; exit 1; }
SSH="ssh -i $SSH_KEY -o ConnectTimeout=15 -o BatchMode=yes"

echo "==> SSH..."; $SSH "$SERVER" "echo OK"

echo "==> Разовая настройка сервера (безопасно повторять)..."
$SSH "$SERVER" bash -s -- "$SYSTEM_USER" "$DB_NAME" "$DB_USER" "$REMOTE_DIR" "$PORT" "$FALLBACK_DOMAIN" <<'REMOTE_SETUP'
set -euo pipefail
SYSTEM_USER="$1"; DB_NAME="$2"; DB_USER="$3"; REMOTE_DIR="$4"; PORT="$5"; FALLBACK_DOMAIN="$6"
id -u "$SYSTEM_USER" &>/dev/null || useradd -m -s /bin/bash "$SYSTEM_USER"
mkdir -p "$REMOTE_DIR"; chown "$SYSTEM_USER:$SYSTEM_USER" "$REMOTE_DIR"
if ! su - postgres -c "psql -tAc \"SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'\"" | grep -q 1; then
  PW=$(openssl rand -hex 24)
  su - postgres -c "psql -c \"CREATE ROLE $DB_USER WITH LOGIN PASSWORD '$PW';\""
  echo "!! Создана роль $DB_USER, пароль (показывается один раз): $PW"
  echo "!! DATABASE_URL=postgres://$DB_USER:$PW@127.0.0.1:5432/$DB_NAME"
fi
su - postgres -c "psql -tAc \"SELECT 1 FROM pg_database WHERE datname='$DB_NAME'\"" | grep -q 1 || su - postgres -c "psql -c \"CREATE DATABASE $DB_NAME OWNER $DB_USER;\""
UNIT="/etc/systemd/system/${SYSTEM_USER}-web.service"
if [ ! -f "$UNIT" ]; then
  cat > "$UNIT" <<EOF2
[Unit]
Description=Tehnik Kotlas — Next.js web (интернет-магазин инструментов)
After=network.target postgresql.service

[Service]
Type=simple
User=$SYSTEM_USER
WorkingDirectory=$REMOTE_DIR
Environment=NODE_ENV=production
Environment=PORT=$PORT
EnvironmentFile=$REMOTE_DIR/.env.local
ExecStart=/usr/bin/npm run start
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF2
  systemctl daemon-reload; systemctl enable "${SYSTEM_USER}-web"
fi
NGINX_SITE="/etc/nginx/sites-available/${SYSTEM_USER}"
if [ ! -f "$NGINX_SITE" ]; then
  cat > "$NGINX_SITE" <<EOF2
server {
    listen 80;
    server_name $FALLBACK_DOMAIN;
    client_max_body_size 8M;
    location / {
        proxy_pass http://127.0.0.1:$PORT;
        proxy_http_version 1.1;
        proxy_buffer_size 64k;
        proxy_buffers 8 64k;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF2
  ln -sf "$NGINX_SITE" "/etc/nginx/sites-enabled/${SYSTEM_USER}"
  nginx -t && systemctl reload nginx
  echo "nginx: http://$FALLBACK_DOMAIN — для HTTPS: certbot --nginx -d $FALLBACK_DOMAIN --non-interactive --agree-tos -m admin@$FALLBACK_DOMAIN --redirect"
else
  # nginx-сайт уже существует — убеждаемся, что proxy_buffer настройки есть (Next 16 502 "upstream sent too big header").
  grep -q "proxy_buffer_size" "$NGINX_SITE" || echo "!! В $NGINX_SITE нет proxy_buffer_size — добавьте вручную, иначе возможен 502 на динамических страницах"
fi
REMOTE_SETUP

echo "==> rsync кода (без -o/-g — см. память про владельца файлов)..."
rsync -rlptDz --delete \
  --exclude node_modules --exclude .next --exclude .git --exclude .env.local --exclude .env.test.local \
  --exclude var --exclude public/uploads --exclude .claude --exclude "*.tsbuildinfo" \
  -e "ssh -i $SSH_KEY" ./ "$SERVER:$REMOTE_DIR/"

echo "==> Установка, миграции, импорт демо-товаров, сборка, рестарт..."
$SSH "$SERVER" bash -s -- "$SYSTEM_USER" "$REMOTE_DIR" <<'REMOTE_BUILD'
set -euo pipefail
SYSTEM_USER="$1"; REMOTE_DIR="$2"
[ -f "$REMOTE_DIR/.env.local" ] || { echo "!! Нет $REMOTE_DIR/.env.local — создайте по .env.local.example"; exit 1; }
cd "$REMOTE_DIR"
mkdir -p var public/uploads
chown -R "$SYSTEM_USER:$SYSTEM_USER" "$REMOTE_DIR"
sudo -u "$SYSTEM_USER" npm install --no-audit --no-fund
sudo -u "$SYSTEM_USER" env $(grep -v '^#' .env.local | grep -v '^$' | xargs) npm run migrate
sudo -u "$SYSTEM_USER" env $(grep -v '^#' .env.local | grep -v '^$' | xargs) npm run seed
rm -rf .next
sudo -u "$SYSTEM_USER" env NODE_OPTIONS=--max-old-space-size=1536 npm run build
systemctl restart "${SYSTEM_USER}-web"
sleep 2
systemctl status "${SYSTEM_USER}-web" --no-pager -l | head -8
REMOTE_BUILD
echo "==> Готово: http://$FALLBACK_DOMAIN"
