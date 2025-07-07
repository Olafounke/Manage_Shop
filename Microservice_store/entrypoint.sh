#!/bin/sh
# Script d'entrée du conteneur ms-store

# 1. Attendre que PostgreSQL soit prêt à accepter les connexions
echo "Attente du démarrage de PostgreSQL sur $POSTGRES_HOST:$POSTGRES_PORT ..."
until PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -p "${POSTGRES_PORT:-5432}" -c '\q' 2>/dev/null; do
  sleep 2
  echo "PostgreSQL n'est pas encore disponible, nouvelle tentative..."
done
echo "PostgreSQL est accessible, continuation du démarrage."

# 2. Déterminer le nom de la base de données (au cas où il ne serait pas déjà fourni)
DB_NAME="${DB_NAME:-db-store-${STORE_NAME}}"

# Créer la base de données du magasin si elle n'existe pas déjà
echo "Vérification de l'existence de la base de données '$DB_NAME'..."
DB_EXISTS=$(PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -p "${POSTGRES_PORT:-5432}" -tAc "SELECT 1 FROM pg_database WHERE datname='${DB_NAME}'")
if [ "$DB_EXISTS" != "1" ]; then
  echo "Création de la base de données '$DB_NAME' pour le magasin..."
  PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$POSTGRES_HOST" -U "$POSTGRES_USER" -p "${POSTGRES_PORT:-5432}" -c "CREATE DATABASE \"${DB_NAME}\";"
else
  echo "La base de données '$DB_NAME' existe déjà. Pas de création nécessaire."
fi

# Construire l'URL de connexion de la base de données pour Doctrine
export DATABASE_URL="postgresql://${POSTGRES_USER}:${POSTGRES_PASSWORD}@${POSTGRES_HOST}:${POSTGRES_PORT:-5432}/${DB_NAME}"

# 3. Générer et exécuter les migrations Doctrine
if [ -f bin/console ]; then
  # Vérifier s'il y a des migrations existantes
  MIGRATION_COUNT=$(find migrations -name "*.php" 2>/dev/null | wc -l)
  
  if [ "$MIGRATION_COUNT" -eq 0 ]; then
    echo "Aucune migration trouvée. Génération de la migration initiale..."
    php bin/console doctrine:migrations:diff --no-interaction || {
      echo "Impossible de générer une migration. Création directe du schéma..."
      php bin/console doctrine:schema:create --no-interaction
    }
  fi
  
  echo "Exécution des migrations Doctrine..."
  php bin/console doctrine:migrations:migrate --no-interaction || {
    echo "Aucune migration n'a été exécutée (peut-être aucune migration disponible)."
    echo "Mise à jour du schéma de la base de données..."
    php bin/console doctrine:schema:update --force --no-interaction
  }
fi

# 4. Démarrer le serveur HTTP interne PHP sur le port du microservice
echo "Lancement du serveur PHP interne sur le port ${PORT}..."
exec php -S 0.0.0.0:"${PORT}" -t public
