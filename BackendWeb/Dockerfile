# BackendWeb/Dockerfile
# Multi-stage Laravel build for Render

FROM node:20-bullseye-slim AS assets
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

FROM php:8.3-fpm
RUN apt-get update && apt-get install -y --no-install-recommends \
        git \
        unzip \
        libzip-dev \
        zlib1g-dev \
        libpng-dev \
        libonig-dev \
        libxml2-dev \
        libicu-dev \
        libcurl4-openssl-dev \
        nginx \
    && docker-php-ext-install pdo pdo_mysql zip mbstring exif pcntl bcmath gd intl \
    && rm -rf /var/lib/apt/lists/*

RUN curl -sS https://getcomposer.org/installer | php -- -- --install-dir=/usr/local/bin --filename=composer

WORKDIR /var/www/html
COPY . .
COPY --from=assets /app/public/build ./public/build
COPY tidb-ca.pem ./tidb-ca.pem

RUN composer install --no-dev --optimize-autoloader --prefer-dist --no-interaction --no-scripts
RUN rm -rf /var/www/html/node_modules
RUN mkdir -p /var/www/html/storage/logs /var/www/html/bootstrap/cache
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
RUN chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Create storage link
RUN php artisan storage:link --force || true
ENV APP_ENV=production
ENV APP_DEBUG=false

# Configure nginx
COPY nginx.conf /etc/nginx/sites-available/default
RUN ln -sf /etc/nginx/sites-available/default /etc/nginx/sites-enabled/

EXPOSE 80
CMD ["sh", "-c", "php artisan optimize:clear || true; php-fpm -D; nginx -g 'daemon off;'"]
