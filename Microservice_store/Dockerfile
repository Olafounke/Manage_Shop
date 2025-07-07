# Utiliser une image PHP CLI (8.x) de base
FROM php:8.2-cli

# Installation des dépendances système et des extensions PHP
RUN apt-get update && apt-get install -y \
    libpq-dev postgresql-client \
    git \
    unzip \
    libzip-dev \
    && docker-php-ext-install pdo pdo_pgsql zip \
    && rm -rf /var/lib/apt/lists/*

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de configuration du projet (composer) et installer les dépendances
COPY composer.json composer.lock ./
RUN php -r "copy('https://getcomposer.org/installer', 'composer-setup.php');" && \
    php composer-setup.php --install-dir=/usr/local/bin --filename=composer && \
    composer install --no-dev --prefer-dist --optimize-autoloader --no-scripts && \
    rm composer-setup.php

# Copier le reste du code de l'application Symfony dans l'image
COPY . /app

# Copier le script d'entrée et lui donner les droits d'exécution
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Définir le script d'entrée et le port par défaut du serveur PHP interne
ENTRYPOINT ["/entrypoint.sh"]
# Le script d'entrée se chargera de démarrer le serveur sur le port spécifié par $STORE_PORT
