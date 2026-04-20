# BackendWeb/Dockerfile
# Multi-stage Laravel build for Render

FROM node:20-bullseye-slim AS assets
WORKDIR /app
COPY BackendWeb/package.json BackendWeb/package-lock.json* ./
RUN npm install
COPY BackendWeb .
RUN npm run build

FROM php:8.3-apache
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
    && docker-php-ext-install pdo pdo_mysql zip mbstring exif pcntl bcmath gd intl \
    && rm -rf /var/lib/apt/lists/*

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer
RUN a2enmod rewrite

WORKDIR /var/www/html
COPY BackendWeb .
COPY --from=assets /app/public/build ./public/build

RUN composer install --no-dev --optimize-autoloader --prefer-dist --no-interaction --no-scripts
RUN rm -rf /var/www/html/node_modules
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

ENV APP_ENV=production
ENV APP_DEBUG=false
ENV APACHE_DOCUMENT_ROOT=/var/www/html/public

RUN sed -ri 's!DocumentRoot /var/www/html!DocumentRoot /var/www/html/public!g' /etc/apache2/sites-available/*.conf
RUN sed -ri 's!<Directory /var/www/html>!<Directory /var/www/html/public>!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

EXPOSE 80
CMD ["apache2-foreground"]
