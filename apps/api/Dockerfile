# ── Étape 1 : dépendances Composer ──────────────────────────────────────────
FROM composer:2 AS deps

WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-interaction \
    --optimize-autoloader \
    --prefer-dist

# ── Étape 2 : image de production ────────────────────────────────────────────
FROM php:8.3-fpm-alpine AS production

# Dépendances système + outils de compilation PECL (supprimés après)
RUN apk add --no-cache \
    nginx \
    supervisor \
    postgresql-dev \
    libpng-dev \
    libjpeg-turbo-dev \
    libwebp-dev \
    freetype-dev \
    oniguruma-dev \
    icu-dev \
    icu-libs \
    zip \
    unzip \
    curl \
 && apk add --no-cache --virtual .build-deps $PHPIZE_DEPS

# Extensions PHP
RUN docker-php-ext-configure gd --with-jpeg --with-webp --with-freetype \
 && docker-php-ext-install -j"$(nproc)" \
    pdo \
    pdo_pgsql \
    opcache \
    pcntl \
    bcmath \
    gd \
    intl \
    mbstring \
 && pecl install redis \
 && docker-php-ext-enable redis \
 && apk del .build-deps

# Opcache
RUN { \
    echo "opcache.enable=1"; \
    echo "opcache.memory_consumption=256"; \
    echo "opcache.interned_strings_buffer=16"; \
    echo "opcache.max_accelerated_files=20000"; \
    echo "opcache.validate_timestamps=0"; \
} > /usr/local/etc/php/conf.d/opcache.ini

WORKDIR /var/www/html

# Code source + vendor
COPY --from=deps /app/vendor ./vendor
COPY . .

# Droits storage
RUN chown -R www-data:www-data storage bootstrap/cache \
 && chmod -R 775 storage bootstrap/cache

# Configuration nginx + supervisor
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

ENTRYPOINT ["/entrypoint.sh"]
