#!/usr/bin/env bash
# Atualiza a VPS para a versão atual da branch production e sobe os containers.
# Chamado pelo CD (GitHub Actions) via SSH, como o usuário fetech:  bash /opt/fetech/deploy/deploy.sh
set -euo pipefail
cd "$(dirname "$0")/.."
test -f .env || { echo "Falta o .env de produção em $(pwd) (modelo: .env.production.example)." >&2; exit 1; }

COMPOSE="docker compose -f docker-compose.prod.yml"
CADDY_CONTAINER="${CADDY_CONTAINER:-wedding-caddy-1}"
SITES_DIR=/opt/caddy-sites
DOMAIN=$(grep -E '^APP_DOMAIN=' .env | cut -d= -f2- | tr -d '"' || true)
test -n "$DOMAIN" || { echo "Defina APP_DOMAIN no .env." >&2; exit 1; }

git fetch --prune origin production
git checkout -q -f production
git reset -q --hard origin/production
echo "Versão: $(git log -1 --format='%h %s')"

docker network inspect proxy >/dev/null 2>&1 || docker network create --subnet 172.30.250.0/24 proxy

$COMPOSE build
$COMPOSE up -d --remove-orphans
$COMPOSE exec -T app php artisan migrate --force
docker image prune -f >/dev/null

# Espera o Nginx responder (healthcheck do compose).
healthy=""
for i in $(seq 1 30); do
  status=$(docker inspect -f '{{.State.Health.Status}}' "$($COMPOSE ps -q web)" 2>/dev/null || true)
  [ "$status" = healthy ] && { healthy=1; echo "Site saudável."; break; }
  sleep 4
done
if [ -z "$healthy" ]; then
  echo "O site não ficou saudável a tempo." >&2
  $COMPOSE logs --tail 80 app web >&2
  exit 1
fi

# Registra o domínio no Caddy compartilhado e recarrega sem derrubar os outros sites.
sed "s/__DOMAIN__/$DOMAIN/g" deploy/caddy/fetech.caddy > "$SITES_DIR/fetech.caddy.new"
mv "$SITES_DIR/fetech.caddy.new" "$SITES_DIR/fetech.caddy"
docker exec "$CADDY_CONTAINER" caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile
echo "Caddy recarregado para $DOMAIN."
