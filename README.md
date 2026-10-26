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

## CI/CD e deploy

- **`main`**: recebe os PRs das branches de trabalho. O CI (`.github/workflows/ci.yml`) roda os testes do backend, o build do frontend e o build das imagens de produção.
- **`production`**: branch do deploy. Só recebe alterações por PR vinda da `main`; não aceita push direto. Cada merge dispara o CD (`.github/workflows/deploy.yml`), que entra na VPS por SSH e roda `deploy/deploy.sh`.

O Fetech divide a VPS com o projeto wedding, mas tem usuário (`fetech`), pasta (`/opt/fetech`), chave SSH, containers, banco e volumes próprios. O HTTPS é feito pelo Caddy da VPS: o deploy grava `deploy/caddy/fetech.caddy` em `/opt/caddy-sites` e recarrega o Caddy, que alcança o Nginx do Fetech pela rede Docker `proxy`.

### Preparação (uma vez)

1. **Wedding**: publicar em produção a versão em que o Caddy importa `/opt/caddy-sites` e entra na rede `proxy`.
2. **VPS, como root**: `bash setup-vps.sh "<chave pública do CI>"` (o script está em `deploy/`). Ele cria o usuário `fetech`, a rede `proxy`, a pasta `/opt/caddy-sites` e clona o repositório em `/opt/fetech`.
3. **VPS, como `fetech`**: criar `/opt/fetech/.env` a partir de `.env.production.example`. Preencha o domínio, a `APP_KEY`, as senhas do banco e o SMTP.
4. **DNS**: apontar o domínio (registro A/AAAA) para o IP da VPS.
5. **GitHub > Settings > Secrets and variables > Actions**:
   - Secrets: `VPS_HOST`, `VPS_USER` (`fetech`), `VPS_SSH_KEY` (chave privada do CI), `VPS_KNOWN_HOSTS` (`ssh-keyscan -t ed25519 <host>`) e, se a porta não for 22, `VPS_PORT`.
   - Variável: `SITE_URL` (`https://seu-dominio.com.br`).
6. **GitHub > Settings > Rules > Rulesets**: proteger a `production` exigindo PR e os checks do CI e bloqueando push direto e force push.

Deploy manual: **Actions > Deploy > Run workflow**. Backups diários do banco ficam em `/opt/fetech/backups` (14 dias).
