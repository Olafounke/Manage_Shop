# Manage Shop

Membres du groupe:

- Romain SEGARIZZI
- Ruth BIAOU ADIMI
- Yannick NTONGA

Cette documentation a pour objectif de vous guider pas à pas dans l’installation, la configuration et le lancement du projet **ManageShop**, une architecture basée sur des microservices utilisant Docker, Node.js, Symfony et MongoDB/PostgreSQL.

---

## **Prérequis**

Avant de commencer, vérifiez que vous avez :

- Windows avec PowerShell
- Docker

---

## **Installation des outils**

### 1. Installer Chocolatey (gestionnaire de paquets Windows)

```powershell
# Exécuter PowerShell en tant qu'ADMINISTRATEUR

Set-ExecutionPolicy Bypass -Scope Process -Force

[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072

iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

### 2. Installer Make

Simplifie les commandes (ex: `make start` au lieu de plusieurs scripts).

```powershell
# Dans PowerShell ADMINISTRATEUR (après installation de Chocolatey)

choco install make
```

### 3. Installer MongoDB Shell (obligatoire)

Permet au worker de détecter les nouveaux magasins dans MongoDB et de créer automatiquement leurs containers Docker.

```powershell
# Dans PowerShell ADMINISTRATEUR (après installation de Chocolatey)

choco install mongodb-shell
```

---

## **Installation et Lancement**

### 1. Cloner le projet

```bash
git clone https://github.com/Olafounke/Manage_Shop
cd Manage_Shop
```

### 2. Configuration des variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
# Configuration MongoDB
MONGODB_USER="manageshop"
MONGODB_PASSWORD="SUinrWMA4CbEDsS8"
MONGODB_OPTIONS="retryWrites=true&w=majority&appName=Cluster0"

API_GATEWAY_MONGODB_CLUSTER="cluster0.b4iwf.mongodb.net/manageShop_users"
PRODUCTS_MONGODB_CLUSTER="cluster0.b4iwf.mongodb.net/manageShop_products"
CARTS_MONGODB_CLUSTER="cluster0.b4iwf.mongodb.net/manageShop_carts"
ORDERS_MONGODB_CLUSTER="cluster0.b4iwf.mongodb.net/manageShop_orders"
STORE_MONGODB_CLUSTER="cluster0.b4iwf.mongodb.net/manageShop_store"
TRANSFERTS_MONGODB_CLUSTER="cluster0.b4iwf.mongodb.net/manageShop_transferts"

# Configuration des ports du serveur
API_GATEWAY_PORT=3000
PRODUCTS_PORT=3001
CARTS_PORT=3002
ORDERS_PORT=3003
TRANSFERTS_PORT=3004

# Configuration PostGresSQL
POSTGRES_USER=postgres
POSTGRES_PASSWORD=secretpassword
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# Configuration CORS
CORS_ORIGIN_FRONT_END="http://localhost"
CORS_ORIGIN_API_GATEWAY="http://localhost:3000"

# URL des microservices
PRODUCT_SERVICE_URL="http://ms-product-service:3001/api"
CART_SERVICE_URL="http://ms-cart-service:3002/api"
ORDER_SERVICE_URL="http://ms-order-service:3003/api"
TRANSFERT_SERVICE_URL="http://ms-transfert-service:3004/api"
STORE_SERVICE_URL="http://localhost"

# Configuration Token
TOKEN_SECRET="mdpsecret"
TOKEN_EXPIRATION="86400000" #24h en milliseconde
PROOF_OF_WORK_DIFFICULTY="3"

# Configuration de bcrypt
BCRYPT_ROUNDS="10"

# Clé Stripe
STRIPE_SECRET_KEY="sk_test_51RdXJDDFjLTwOvTBf9OTR2DshjM0fvewY6efnX9Gu5iYKSYYqEGa6HWlFTtQ5dbG9bNXzh3dKqFio69SOnsojwi100TDmbtYhx"
```

Créez un second fichier .env à déposer dans `./Microservice_store` :

```bash
cd Microservice_store
```

```env
###> symfony/framework-bundle ###
APP_ENV=dev
APP_SECRET=576777e1a74f0a3586ee973c599b3fb7
###< symfony/framework-bundle ###

###> nelmio/cors-bundle ###
CORS_ALLOW_ORIGIN='^https?://(localhost|127\.0\.0\.1)(:[0-9]+)?$'
###< nelmio/cors-bundle ###

###> doctrine/doctrine-bundle ###
DATABASE_URL="postgresql://app:!ChangeMe!@127.0.0.1:5432/app?serverVersion=16&charset=utf8"
###< doctrine/doctrine-bundle ###
```

### 3. Lancer l'application

#### Commandes Make disponibles :

```bash
# Gestion du projet
make start          # Démarrer tous les services + worker en arrière-plan
make stop           # Arrêter tous les services et le worker
make restart        # Redémarrer complètement le projet
make rebuild        # Reconstruire les images Docker et redémarrer
make clean          # Arrêt + nettoyage complet (containers, volumes, networks)

# Gestion du worker (surveillance des nouveaux magasins)
make worker-start   # Démarrer uniquement le worker
make worker-stop    # Arrêter uniquement le worker
make worker-status  # Voir si le worker est actif
make worker-restart # Redémarrer uniquement le worker
```

#### Commandes PowerShell complètes :

```powershell
# Démarrer le projet complet
.\_scripts\start-project.ps1                    # Génère les magasins + démarre tous les services + worker
.\_scripts\start-project.ps1 -Rebuild           # Démarrer avec reconstruction des images

# Arrêter le projet
.\_scripts\stop-project.ps1                     # Arrête tous les services et le worker
.\_scripts\stop-project.ps1 -Clean              # Arrêt + nettoyage complet

# Gestion du worker uniquement
.\_scripts\manage-worker.ps1 start              # Démarrer le worker
.\_scripts\manage-worker.ps1 stop               # Arrêter le worker
.\_scripts\manage-worker.ps1 status             # Voir si le worker est actif
.\_scripts\manage-worker.ps1 restart            # Redémarrer le worker
```

### 4. Accéder à l'application

- **Frontend** : http://localhost
- **API Gateway** : http://localhost:3000

#### Comptes pour la navigation :

```
# Compte super_admin
Login : romain.segarizzi@hotmail.fr
Mot de passe : admin


# Compte admin_store
Login : admin@shopland.com
Mot de passe : admin

Login : admin@buymarket.com
Mot de passe : admin

Login : admin@tradezone.com
Mot de passe : admin


# Compte user
Login : user@manageshop.com
Mot de passe : user
```

---

## Structure du projet

Voici les dossiers et fichiers principaux du projet :

```
ManageShop/
├── _docker-compose/               → Fichiers docker-compose
├── _scripts/                      → Fichiers de script pour lancer le projet
├── API_Gateway/                   → Code source de l'API Gateway
├── Frontend/                      → Code source du front-end
├── Microservice_carts/            → Code source du microservice des paniers
├── Microservice_orders/           → Code source du microservice des commandes
├── Microservice_products/         → Code source du microservice des produits
├── Microservice_store/            → Code source du microservice des magasins
├── Microservice_transfert/        → Code source du microservice des transferts
├── Makefile                       → Lancement du projet
```

---

## Langage de programmation utilisé

- **Lancement dynamique des containers Docker :**

  - script PowerShell

- **Frontend :**

  - TypeScript
  - Angular

- **API Gateway et sa BDD :**

  - JavaScript
  - NodeJS + ExpressJS
  - Mongoose + MongoDB

- **Microservice des magasins :**

  - PHP
  - Symfony
  - PostgreSQL

- **Tous les autres microservices :**
  - TypeScript
  - NodeJS + ExpressJS
  - Mongoose + MongoDB
