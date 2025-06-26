# Manage Shop

Membres du groupe:

- Romain SEGARIZZI
- Ruth BIAOU ADIMI
- Yannick NTONGA

## Installation et Lancement

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd Manage_Shop
```

### 2. Configuration des variables d'environnement

Créez un fichier `.env` à la racine du projet

```env

# Configuration MongoDB
MONGODB_USER="manageshop"
MONGODB_PASSWORD="SUinrWMA4CbEDsS8"
MONGODB_OPTIONS="retryWrites=true&w=majority&appName=Cluster0"

API_GATEWAY_MONGODB_CLUSTER="cluster0.b4iwf.mongodb.net/manageShop_users"
PRODUCTS_MONGODB_CLUSTER="cluster0.b4iwf.mongodb.net/manageShop_products"
CARTS_MONGODB_CLUSTER="cluster0.b4iwf.mongodb.net/manageShop_carts"
ORDERS_MONGODB_CLUSTER="cluster0.b4iwf.mongodb.net/manageShop_orders"

# Configuration des ports du serveur
API_GATEWAY_PORT=3000
PRODUCTS_PORT=3001
CARTS_PORT=3002
ORDERS_PORT=3003

# Configuration CORS
CORS_ORIGIN_FRONT_END="http://localhost"
CORS_ORIGIN_API_GATEWAY="http://localhost:3000"

# URL des microservices
PRODUCT_SERVICE_URL="http://ms-product-service:3001/api"
CART_SERVICE_URL="http://ms-cart-service:3002/api"
ORDER_SERVICE_URL="http://ms-order-service:3003/api"


# Configuration Token
TOKEN_SECRET="mdpsecret"
TOKEN_EXPIRATION="86400000" #24h en milliseconde
PROOF_OF_WORK_DIFFICULTY="3"

# Configuration de bcrypt
BCRYPT_ROUNDS="10"

# Clé Stripe
STRIPE_SECRET_KEY="sk_test_51RdXJDDFjLTwOvTBf9OTR2DshjM0fvewY6efnX9Gu5iYKSYYqEGa6HWlFTtQ5dbG9bNXzh3dKqFio69SOnsojwi100TDmbtYhx"

```

### 3. Lancer l'application

```bash
# Construire et démarrer tous les services
docker-compose up --build

# Ou en mode détaché (en arrière-plan)
docker-compose up --build -d
```

### 4. Accéder à l'application

- **Frontend** : http://localhost:80
