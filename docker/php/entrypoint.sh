#!/bin/sh
# Produção: gera os caches do Laravel (config, rotas, views, eventos) com as variáveis do .env antes de subir o PHP-FPM.
set -e
php artisan optimize
exec "$@"
