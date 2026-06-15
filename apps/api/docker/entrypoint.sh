#!/bin/sh
set -e

cd /var/www/html

# Cache Laravel (utilise les env vars injectées au runtime)
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Migrations automatiques au démarrage
php artisan migrate --force

exec /usr/bin/supervisord -n -c /etc/supervisor/conf.d/supervisord.conf
