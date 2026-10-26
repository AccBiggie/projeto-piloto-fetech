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
