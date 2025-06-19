require("dotenv").config();

// Construction de l'URL MongoDB
const MONGODB_USER = process.env.MONGODB_USER;
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD;
const MONGODB_CLUSTER = process.env.MONGODB_CLUSTER;
const MONGODB_OPTIONS = process.env.MONGODB_OPTIONS;
const constructMongoDBUri = () => {
  if (MONGODB_USER && MONGODB_PASSWORD) {
    return `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_CLUSTER}?${MONGODB_OPTIONS}`;
  }
};

const safeParseInt = (value, defaultValue) => {
  const parsed = parseInt(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

module.exports = {
  PORT: process.env.PORT,

  DB_URI: constructMongoDBUri(),

  TOKEN_SECRET: process.env.TOKEN_SECRET,
  TOKEN_EXPIRATION: safeParseInt(process.env.TOKEN_EXPIRATION, 86400000),

  BCRYPT_ROUNDS: safeParseInt(process.env.BCRYPT_ROUNDS, 10),
  PROOF_OF_WORK_DIFFICULTY: safeParseInt(process.env.PROOF_OF_WORK_DIFFICULTY, 3),

  CORS_ORIGIN: process.env.CORS_ORIGIN,
};
