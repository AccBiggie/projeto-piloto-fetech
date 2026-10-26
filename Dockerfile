FROM php:8.5-fpm-alpine

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
