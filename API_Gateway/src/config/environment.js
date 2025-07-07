require("dotenv").config();

// Construction de l'URL MongoDB pour Users
const MONGODB_USER = process.env.MONGODB_USER;
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD;
const MONGODB_CLUSTER_USERS = process.env.MONGODB_CLUSTER_USERS;
const MONGODB_CLUSTER_STORES = process.env.MONGODB_CLUSTER_STORES;
const MONGODB_OPTIONS = process.env.MONGODB_OPTIONS;
const constructUserMongoDBUri = () => {
  if (MONGODB_USER && MONGODB_PASSWORD) {
    return `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_CLUSTER_USERS}?${MONGODB_OPTIONS}`;
  }
};

const constructStoreMongoDBUri = () => {
  if (MONGODB_USER && MONGODB_PASSWORD) {
    return `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_CLUSTER_STORES}?${MONGODB_OPTIONS}`;
  }
};

const safeParseInt = (value, defaultValue) => {
  const parsed = parseInt(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

module.exports = {
  PORT: process.env.PORT,

  USERS_DB_URI: constructUserMongoDBUri(),
  STORES_DB_URI: constructStoreMongoDBUri(),

  TOKEN_SECRET: process.env.TOKEN_SECRET,
  TOKEN_EXPIRATION: safeParseInt(process.env.TOKEN_EXPIRATION, 86400000),

  BCRYPT_ROUNDS: safeParseInt(process.env.BCRYPT_ROUNDS, 10),
  PROOF_OF_WORK_DIFFICULTY: safeParseInt(process.env.PROOF_OF_WORK_DIFFICULTY, 3),

  CORS_ORIGIN: process.env.CORS_ORIGIN,

  PRODUCT_SERVICE_URL: process.env.PRODUCT_SERVICE_URL,
  CART_SERVICE_URL: process.env.CART_SERVICE_URL,
  ORDER_SERVICE_URL: process.env.ORDER_SERVICE_URL,
  STORE_SERVICE_URL: process.env.STORE_SERVICE_URL,
  TRANSFERT_SERVICE_URL: process.env.TRANSFERT_SERVICE_URL,
};
