<p align="center"><a href="https://accbiggie.github.io/" target="_blank"><img src="https://raw.githubusercontent.com/AccBiggie/projeto-piloto-fetech/21d66e9b8272f105644beff50301c6b601c6f5d9/public/assets/logos/LogoFetech2.svg" width="400" alt="Fetech Logo" title="Fetech Logo"></a></p>

## Sobre a FETECH

A mais de 3 anos no mercado, a FETECH é uma empresa especializada em reparos de computadores e seus periféricos e televisores. O projeto consiste em criar um ambiente onde possa ser feito o Portifólio empresarial através de um site e sistema de gestão que irá controlar algumas rotinas essênciais da empresa, abaixo constam as tecnologias que serão utilizadas:

- Front-end - [React 19](https://react.dev/) com [TypeScript](https://www.typescriptlang.org/), [Material UI](https://mui.com/material-ui/) e [Material Icons](https://mui.com/material-ui/material-icons/), empacotado com [Vite](https://vite.dev/).
- Ambiente de desenvolvimento com [Docker](https://docs.docker.com/).
- Back-end - [PHP 8.5](https://www.php.net/manual/en/) - [LARAVEL 13](https://laravel.com/docs/13.x).
- Banco de dados [MYSQL](https://dev.mysql.com/doc/) com [migrações de esquema](https://laravel.com/docs/migrations).

##

<p align="center"><a href="https://accbiggie.github.io/" target="_blank"><img src="https://raw.githubusercontent.com/AccBiggie/projeto-piloto-fetech/8171bdaf63b03657f1e70a4842e89f812b9df161/public/assets/logos/LogoHeader.svg" width="200" alt="Fetech Logo" title="Fetech Logo"></a></p>

## Executar no WSL com Docker Engine

No terminal do WSL, a partir da pasta do projeto:

```bash
cp .env.example .env
docker compose up -d --build
docker compose exec app composer install
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate
docker compose run --rm node sh -c "npm ci && npm run build"
```

O arquivo `.env` local não é versionado.

| Serviço | Endereço |
|---|---|
| Aplicação | http://localhost:3001 |
| phpMyAdmin | http://localhost:8080 (usuário `root`, senha `root`) |
| MySQL | `localhost:3308` |

As portas só aceitam conexões da própria máquina. Os dados do MySQL ficam no volume Docker `mysql_data`.

### Frontend em modo desenvolvimento

Para editar o React com recarga automática, suba o servidor do Vite:

```bash
docker compose --profile dev up -d node
```

Enquanto ele estiver rodando, a aplicação em http://localhost:3001 carrega os arquivos de `resources/js` direto do Vite. Para voltar ao build estático, pare o container (`docker compose stop node`) e rode o `npm run build` acima.

### Testes

```bash
docker compose exec app php artisan test
docker compose run --rm node npm run typecheck
```

## Arquitetura

- `resources/js`: SPA em React. O Laravel entrega apenas o shell em `resources/views/app.blade.php`.
- `routes/api.php`: API consumida pelo frontend (`POST /api/contato`).
- `docker/`: configurações do Nginx e do PHP-FPM.

## Proteção contra excesso de requisições

O tráfego passa por duas camadas antes de chegar à aplicação:

1. **Nginx** (`docker/nginx/default.conf`): limita cada IP a 10 req/s nas páginas (rajada de até 40) e 2 req/s na API (rajada de até 10), no máximo 20 conexões simultâneas por IP, além de timeouts curtos e corpo de até 8 MB. Arquivos estáticos não entram na conta. Acima do limite, responde `429`.
2. **Laravel** (`config/security.php`, contadores no Redis): 300 req/min por IP nas páginas, 60 req/min na API e, no formulário de contato, 3 envios por minuto e 20 por dia. Os valores podem ser ajustados pelo `.env` (`RATE_LIMIT_*`).

Também há cabeçalhos de segurança (CSP com nonce, `X-Frame-Options`, `nosniff`), validação de todos os campos no servidor e um campo honeypot contra bots no formulário.

Essas camadas seguram floods de aplicação (muitas requisições de poucos IPs). Ataques volumétricos distribuídos (DDoS de rede) precisam ser barrados antes do servidor, por um CDN/WAF como Cloudflare. Nesse caso, configure `real_ip` no Nginx para que os limites usem o IP do visitante.

## Painel de clientes

Área administrativa em `/painel` para cadastrar os clientes da FETECH, ativar ou suspender cada um e acompanhar o uso do site de cada cliente: requisições por hora ou por dia (24 h, 7, 30 e 90 dias), respostas por status, dados enviados e tempo médio.

- **Acesso:** e-mail e senha (hash **Argon2id**, `config/hashing.php`) seguidos do código de 6 dígitos de um app autenticador (TOTP, via Laravel Fortify), com códigos de recuperação. O 2FA é obrigatório: quem ainda não configurou é levado à tela do QR code e a API responde 403 até a confirmação. Login limitado a 5 tentativas por minuto por e-mail e IP (e 20 por IP); código TOTP, a 5 por minuto. Não há cadastro público nem redefinição de senha por e-mail.
- **Administradores:** criados pela linha de comando, que pede a senha (mínimo de 12 caracteres, com maiúsculas, minúsculas, números e símbolos):

  ```bash
  docker compose exec app php artisan painel:usuario voce@fetech.systems --name="Seu Nome"
  # Produção: docker compose -f docker-compose.prod.yml exec app php artisan painel:usuario ...
  # Celular perdido sem códigos de recuperação: o mesmo comando com --reset-2fa
  ```

- **Estatísticas:** o serviço `scheduler` roda `php artisan painel:importar-acessos` a cada minuto. Ele lê só as linhas novas dos logs JSON do Caddy (guarda a posição de cada arquivo e termina o arquivo antigo quando o Caddy o rotaciona), soma as requisições por domínio e hora em `request_stats` e apaga o que passar de `PAINEL_RETENTION_DAYS`. Cada cliente vê os domínios cadastrados nele; acessos de domínios ainda não cadastrados ficam guardados e aparecem quando o domínio é cadastrado.
- **Bloquear** (motivo *manual* ou *inadimplência*, com observação) tira o site do ar na hora: os domínios do cliente passam a mostrar uma página de suspensão (503). Se o bloqueio durar mais que `PAINEL_PARAR_APOS_DIAS` (7 por padrão), os containers do projeto do cliente também são parados; ao desbloquear, eles são religados e só então a página sai. Cada bloqueio e desbloqueio fica no histórico do cliente, com quem fez. Detalhes em "Bloqueio de clientes", abaixo.

### Ligar os logs do Caddy (uma vez, na VPS)

1. **Wedding** (dono do container do Caddy): montar a pasta do host `/opt/caddy-logs` em `/var/log/caddy` no serviço do Caddy e publicar.
2. Em **cada site** que deve aparecer no painel (o `fetech.caddy` e os arquivos dos clientes em `/opt/caddy-sites`), incluir no bloco do domínio:

   ```caddy
   log {
   	output file /var/log/caddy/access.log {
   		roll_size 50MiB
   		roll_keep 10
   		roll_uncompressed
   		mode 0644
   	}
   	format json
   }
   ```

   Todos os sites podem gravar no mesmo arquivo, com a mesma configuração. `roll_uncompressed` deixa o importador terminar o arquivo rotacionado, e `mode 0644` (Caddy 2.8 ou mais novo) deixa o container do Fetech ler o log. Depois, `docker exec wedding-caddy-1 caddy reload --config /etc/caddy/Caddyfile --adapter caddyfile`.
3. **`.env` do Fetech:** `CADDY_LOG_DIR=/opt/caddy-logs` e `CADDY_ACCESS_LOGS=/var/log/caddy/access.log` (modelo em `.env.production.example`). Para conferir: `docker compose -f docker-compose.prod.yml exec scheduler php artisan painel:importar-acessos`.

### Bloqueio de clientes

Cada cliente tem o próprio projeto Docker em `/opt/clientes/<projeto>` (com o `docker-compose.yml`) e um arquivo de site em `/opt/caddy-sites/<projeto>.caddy`, importado pelo Caddy do wedding, como o Fetech. O painel não tem acesso ao Docker: ele só grava arquivos, e quem age são o Caddy e um script da VPS.

```
painel ──grava──▶ /opt/caddy-bloqueios/painel/hosts/<domínio>  ──lido a cada requisição──▶ Caddy (página 503)
       ──grava──▶ /opt/caddy-bloqueios/painel/parar.txt        ──a cada minuto──▶ fetech-bloqueios (root)
       ◀──lê───── /opt/caddy-bloqueios/parados/<projeto>       ◀──marca o que parou──┘   docker compose stop/start
```

- **Página de suspensão:** o trecho `deploy/caddy/suspensao.caddy` (gravado pelo deploy em `/opt/caddy-sites/00-suspensao.caddy`) confere se existe o arquivo com o nome do domínio e, se existir, responde com `deploy/caddy/suspenso.html`, status 503 e `Retry-After`. Vale na hora, sem reload do Caddy. Se o Fetech cair, os sites continuam como estão.
- **Containers:** `painel:sincronizar-bloqueios` (a cada minuto, no `scheduler`, e logo depois de cada alteração no painel) lista em `parar.txt` os projetos bloqueados há mais que o prazo. O script `deploy/bloqueios/containers.sh` (instalado como `/usr/local/sbin/fetech-bloqueios`, timer `fetech-bloqueios.timer`) para esses projetos, para de novo os que forem religados durante o bloqueio e religa os que saírem da lista. Só aceita nomes de pasta simples dentro de `/opt/clientes` com um arquivo compose; links simbólicos são ignorados.
- **Sem projeto cadastrado**, o bloqueio fica só na página de suspensão.
- **Faturas:** o futuro controle de faturas bloqueia com `$client->block(BlockReason::Nonpayment, ...)` e libera com `$client->unblock(...)`; o resto acontece sozinho.

**Ligar (uma vez, na VPS):**

1. Como root, rodar de novo `bash /opt/fetech/deploy/setup-vps.sh "<chave pública do CI>"`: cria `/opt/caddy-bloqueios` (`painel/` gravável pelo PHP do Fetech, UID 1000), `/opt/clientes` e instala o timer. Rode de novo sempre que `deploy/bloqueios/` mudar.
2. **Wedding:** montar `/opt/caddy-bloqueios` em `/srv/bloqueios` (só leitura) no serviço do Caddy e publicar.
3. **`.env` do Fetech:** `PAINEL_BLOQUEIOS_DIR=/var/lib/painel/bloqueios`, `PAINEL_PARADOS_DIR=/var/lib/painel/parados` e `PAINEL_PARAR_APOS_DIAS` (modelo em `.env.production.example`), e fazer o deploy.
4. **Cada site de cliente:** começar o bloco do domínio com `import suspensao` (modelo em `deploy/caddy/cliente.caddy.example`), recarregar o Caddy e cadastrar no painel o nome da pasta do projeto.

Para conferir: `systemctl list-timers fetech-bloqueios.timer`, `journalctl -u fetech-bloqueios` e `docker compose -f docker-compose.prod.yml exec scheduler php artisan painel:sincronizar-bloqueios`.

## CI/CD e deploy

- **`main`**: recebe os PRs das branches de trabalho. O CI (`.github/workflows/ci.yml`) roda os testes do backend, o build do frontend e o build das imagens de produção.
- **`production`**: branch do deploy. Só recebe alterações por PR vinda da `main`; não aceita push direto. Cada merge dispara o CD (`.github/workflows/deploy.yml`), que entra na VPS por SSH e roda `deploy/deploy.sh`.

O Fetech divide a VPS com o projeto wedding, mas tem usuário (`fetech`), pasta (`/opt/fetech`), chave SSH, containers, banco e volumes próprios. O HTTPS é feito pelo Caddy da VPS: o deploy grava `deploy/caddy/fetech.caddy` em `/opt/caddy-sites` e recarrega o Caddy, que alcança o Nginx do Fetech pela rede Docker `proxy`.

### Preparação (uma vez)

1. **Wedding**: publicar em produção a versão em que o Caddy importa `/opt/caddy-sites` e entra na rede `proxy`.
2. **VPS, como root**: `bash setup-vps.sh "<chave pública do CI>"` (o script está em `deploy/`). Ele cria o usuário `fetech`, a rede `proxy`, a pasta `/opt/caddy-sites` e clona o repositório em `/opt/fetech`.
3. **VPS, como `fetech`**: criar `/opt/fetech/.env` a partir de `.env.production.example`. Preencha o domínio, a `APP_KEY`, as senhas do banco e o SMTP.
4. **DNS**: apontar para o IP da VPS (registros A/AAAA) **os dois** nomes, `fetech.systems` e `www.fetech.systems`. O canônico é o `www`: com `APP_DOMAIN=www.fetech.systems`, o deploy configura o Caddy para emitir o certificado dos dois e redirecionar (301) o endereço sem `www`, mantendo caminho e query. O `APP_URL` precisa ser exatamente `https://www.fetech.systems`, porque canonical, Open Graph, JSON-LD e sitemap saem dele.
5. **GitHub > Settings > Secrets and variables > Actions**:
   - Secrets: `VPS_HOST`, `VPS_USER` (`fetech`), `VPS_SSH_KEY` (chave privada do CI), `VPS_KNOWN_HOSTS` (`ssh-keyscan -t ed25519 <host>`) e, se a porta não for 22, `VPS_PORT`.
   - Variável: `SITE_URL` (`https://seu-dominio.com.br`).
6. **GitHub > Settings > Rules > Rulesets**: proteger a `production` exigindo PR e os checks do CI e bloqueando push direto e force push.

Deploy manual: **Actions > Deploy > Run workflow**. Backups diários do banco ficam em `/opt/fetech/backups` (14 dias).
