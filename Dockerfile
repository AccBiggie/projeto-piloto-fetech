FROM php:8.0-apache

ARG TZ=America/Sao_Paulo
ENV TZ=${TZ}

RUN sed -i 's|http://deb.debian.org/debian-security|http://archive.debian.org/debian-security|; s|http://deb.debian.org/debian|http://archive.debian.org/debian|' /etc/apt/sources.list \
    && apt-get update -o Acquire::Check-Valid-Until=false \
    && apt-get install -y --no-install-recommends libpng-dev libxslt1-dev libzip-dev unzip \
    && docker-php-ext-install bcmath gd pdo_mysql xsl zip \
    && a2enmod rewrite \
    && rm -rf /var/lib/apt/lists/*

COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer
COPY fetech.conf /etc/apache2/sites-available/fetech.conf
RUN a2dissite 000-default && a2ensite fetech.conf

EXPOSE 80
CMD ["apache2-foreground"]
