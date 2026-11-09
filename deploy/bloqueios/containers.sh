#!/usr/bin/env bash
# Para e religa os containers dos clientes bloqueados no painel do Fetech. Roda na VPS como root, a cada
# minuto, pelo timer fetech-bloqueios.timer (instalado pelo deploy/setup-vps.sh em /usr/local/sbin).
#
# Entrada: /opt/caddy-bloqueios/painel/parar.txt, gravado pelo painel, com um projeto por linha (pasta em
# /opt/clientes com o docker-compose do cliente). Saída: /opt/caddy-bloqueios/parados/<projeto>, um arquivo
# por projeto parado por este script. Quem sai da lista é religado e só então perde a marca; enquanto a marca
# existir, o painel mantém a página de suspensão, para o site não voltar com erro antes dos containers subirem.
#
# O painel só escreve a lista: ele não tem acesso ao Docker. Nomes fora do padrão, links simbólicos e pastas
# fora de /opt/clientes são ignorados, então nada além dos projetos de clientes pode ser parado.
set -uo pipefail

BASE=${FETECH_BLOQUEIOS_DIR:-/opt/caddy-bloqueios}
PROJECTS=${FETECH_CLIENTES_DIR:-/opt/clientes}
LIST="$BASE/painel/parar.txt"
STATE="$BASE/parados"
NAME_RE='^[a-z0-9][a-z0-9_-]{0,62}$'

# Sem a lista (painel ainda não sincronizou), não mexe em nada
[ -f "$LIST" ] || exit 0
[ -d "$PROJECTS" ] || exit 0
install -d -m 755 "$STATE"
ROOT=$(realpath -e "$PROJECTS")

# Pasta do projeto, se o nome for válido, a pasta for real (sem link simbólico) e tiver um compose
project_dir() {
	local name=$1 dir file
	[[ $name =~ $NAME_RE ]] || return 1
	dir=$(realpath -e "$ROOT/$name" 2>/dev/null) || return 1
	[ "$dir" = "$ROOT/$name" ] || return 1
	for file in compose.yaml compose.yml docker-compose.yaml docker-compose.yml; do
		[ -f "$dir/$file" ] && { echo "$dir"; return 0; }
	done
	return 1
}

compose() { (cd "$1" && shift && docker compose "$@"); }

declare -A want=()
while IFS= read -r name || [ -n "$name" ]; do
	[[ $name =~ $NAME_RE ]] && want[$name]=1
done < "$LIST"

status=0

for name in "${!want[@]}"; do
	if ! dir=$(project_dir "$name"); then
		echo "Ignorado (pasta ou compose não encontrado em $ROOT): $name" >&2
		continue
	fi
	# Para também o que for religado à mão ou por um deploy durante o bloqueio
	if [ -n "$(compose "$dir" ps -q --status running)" ]; then
		if compose "$dir" stop; then echo "Parado: $name"; else status=1; continue; fi
	fi
	touch "$STATE/$name"
done

for marker in "$STATE"/*; do
	[ -e "$marker" ] || continue
	name=$(basename "$marker")
	[ -n "${want[$name]:-}" ] && continue
	if dir=$(project_dir "$name"); then
		if compose "$dir" start; then echo "Religado: $name"; else status=1; continue; fi
	fi
	rm -f "$marker"
done

exit $status
