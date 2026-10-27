# Estágios: base (desenvolvimento, código via bind mount), production (app) e web (Nginx).
# Produção: docker compose -f docker-compose.prod.yml build

FROM php:8.5-fpm-alpine AS base

ARG TZ=America/Sao_Paulo
ARG UID=1000
ARG GID=1000
ENV TZ=${TZ}

RUN apk add --no-cache icu-libs libzip tzdata \
    && apk add --no-cache --virtual .build-deps $PHPIZE_DEPS icu-dev libzip-dev linux-headers shadow \
    && docker-php-ext-install bcmath intl pdo_mysql zip \
    && pecl install redis \
    && docker-php-ext-enable redis \
    # www-data com o mesmo UID do usuário do WSL: arquivos criados pelo PHP ficam com o dono certo no bind mount
    && usermod -u ${UID} www-data && groupmod -g ${GID} www-data \
    && apk del .build-deps \
    && rm -rf /tmp/pear

COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer
COPY docker/php/php.ini /usr/local/etc/php/conf.d/zz-fetech.ini
COPY docker/php/www.conf /usr/local/etc/php-fpm.d/zz-fetech.conf

WORKDIR /var/www/html

# Build do frontend (React/Vite)
FROM node:24-alpine AS assets
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci
COPY tsconfig.json vite.config.ts ./
COPY resources ./resources
RUN npm run build

FROM base AS production

# "zzz-" para ser lido depois do zz-fetech.ini (os .ini são carregados em ordem alfabética)
COPY docker/php/php.production.ini /usr/local/etc/php/conf.d/zzz-fetech-production.ini
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction --no-progress
# Código só leitura para o PHP; apenas storage e bootstrap/cache são graváveis
COPY . .
COPY --from=assets /app/public/build ./public/build
COPY --chmod=755 docker/php/entrypoint.sh /usr/local/bin/fetech-entrypoint
RUN composer dump-autoload --optimize --classmap-authoritative --no-dev \
    && php artisan package:discover --ansi \
    && rm -rf tests docker \
    && chown -R www-data:www-data storage bootstrap/cache

USER www-data
ENTRYPOINT ["/usr/local/bin/fetech-entrypoint"]
CMD ["php-fpm"]

FROM nginx:1.30-alpine AS web
COPY docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY docker/nginx/production/real-ip.conf /etc/nginx/conf.d/00-real-ip.conf
COPY docker/nginx/production/https.conf /etc/nginx/snippets/https.conf
COPY public /var/www/html/public
COPY --from=assets /app/public/build /var/www/html/public/build
