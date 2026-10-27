#!/usr/bin/env bash
# Prepara a VPS para o Fetech uma única vez. Rodar como root:  bash setup-vps.sh "<chave pública do CI>"
# A VPS já tem Docker e firewall (setup do projeto wedding). Este script cria só o que é do Fetech:
# usuário "fetech" (entra apenas com a chave do CI), /opt/fetech, a rede "proxy" e a pasta de sites do Caddy.
set -euo pipefail
CI_PUBKEY="${1:?uso: bash setup-vps.sh \"ssh-ed25519 AAAA... github-actions-fetech-deploy\"}"
APP_USER=fetech
APP_DIR=/opt/fetech
SITES_DIR=/opt/caddy-sites
REPO=https://github.com/AccBiggie/projeto-piloto-fetech.git

command -v docker >/dev/null || { echo "Docker não encontrado. Instale antes (deploy/setup-vps.sh do wedding)." >&2; exit 1; }

# Usuário sem senha, separado do usuário de deploy do wedding
id "$APP_USER" >/dev/null 2>&1 || adduser --disabled-password --gecos "" "$APP_USER"
usermod -aG docker "$APP_USER"
install -d -m 700 -o "$APP_USER" -g "$APP_USER" "/home/$APP_USER/.ssh"
AUTH="/home/$APP_USER/.ssh/authorized_keys"
touch "$AUTH"
# "restrict": a chave do CI só executa comandos (sem túnel, sem encaminhamento de porta/agente)
grep -qF "$CI_PUBKEY" "$AUTH" || echo "restrict $CI_PUBKEY" >> "$AUTH"
chown "$APP_USER:$APP_USER" "$AUTH" && chmod 600 "$AUTH"

# Rede compartilhada entre o Caddy e os sites; sub-rede fixa (usada no real_ip do Nginx)
docker network inspect proxy >/dev/null 2>&1 || docker network create --subnet 172.30.250.0/24 proxy

# Sites extras lidos pelo Caddy; graváveis pelos usuários do grupo docker
install -d -m 2775 -o root -g docker "$SITES_DIR"

install -d -o "$APP_USER" -g "$APP_USER" "$APP_DIR"
[ -d "$APP_DIR/.git" ] || sudo -u "$APP_USER" git clone -q -b production "$REPO" "$APP_DIR"

echo
echo "== Pronto. Agora crie $APP_DIR/.env (modelo: $APP_DIR/.env.production.example) como $APP_USER:"
echo "   sudo -u $APP_USER cp $APP_DIR/.env.production.example $APP_DIR/.env && sudo -u $APP_USER chmod 600 $APP_DIR/.env"
