ARG TZ=America/Sao_Paulo

FROM ubuntu:20.04

# Configure timezone
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime \
    && echo $TZ > /etc/timezone

# Update packages and install dependencies
RUN apt-get update \
    && apt-get upgrade -y \
    && apt-get install -y software-properties-common \
    tzdata \
    unzip \
    sudo \
    vim \
    curl

# Add the PHP 8.1 repository and install PHP and dependencies
RUN add-apt-repository -y ppa:ondrej/php && apt-get -y update
RUN apt install -y php8.0
RUN apt install -y php8.0-cli
RUN apt install -y php8.0-dev
RUN apt install -y php8.0-xml
RUN apt install -y php8.0-curl
RUN apt install -y php8.0-bcmath
RUN apt install -y php8.0-gd
RUN apt install -y php8.0-mbstring
RUN apt install -y php8.0-mysql
RUN apt install -y php8.0-xsl
RUN apt install -y php8.0-zip

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php8.0 -- --install-dir=/usr/local/bin --filename=composer

# Configure Apache
ENV APACHE_RUN_USER www-data
ENV APACHE_RUN_GROUP www-data

# Install Apache and dependencies
RUN apt-get install -y \
    apache2 \
    apache2-utils \
    libapache2-mod-php7.4 \
  && a2dismod mpm_event \
  && a2enmod mpm_prefork \
  && a2enmod php8.0 \
  && a2enmod xml2enc \
  && echo "ServerName localhost" >> /etc/apache2/apache2.conf \
  && a2enmod rewrite \
  && a2dissite 000-default

# Copy the Apache configuration file
COPY fetech.conf /etc/apache2/sites-available/fetech.conf
RUN ln -s /etc/apache2/sites-available/fetech.conf /etc/apache2/sites-enabled/fetech.conf \
    && a2ensite fetech.conf

# Set PHP as the default PHP binary
RUN update-alternatives --set php /usr/bin/php8.0

# Set the owner of the document root to www-data
RUN chown -R www-data:www-data /var/www

# Restart Apache
RUN service apache2 restart

# Clean up
RUN apt-get clean

# Expose the HTTP port
EXPOSE 80

# Start Apache in the foreground
CMD ["/usr/sbin/apache2ctl", "-DFOREGROUND"]