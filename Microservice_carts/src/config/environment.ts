import dotenv from "dotenv";

dotenv.config();

// Construction de l'URL MongoDB
const MONGODB_USER = process.env.MONGODB_USER;
const MONGODB_PASSWORD = process.env.MONGODB_PASSWORD;
const MONGODB_CLUSTER = process.env.MONGODB_CLUSTER;
const MONGODB_OPTIONS = process.env.MONGODB_OPTIONS;

const constructMongoDBUri = (): string | undefined => {
  if (MONGODB_USER && MONGODB_PASSWORD) {
    return `mongodb+srv://${MONGODB_USER}:${MONGODB_PASSWORD}@${MONGODB_CLUSTER}?${MONGODB_OPTIONS}`;
  }
  return undefined;
};

const safeParseInt = (value: string | undefined, defaultValue: number): number => {
  if (!value) return defaultValue;
  const parsed = parseInt(value);
  return isNaN(parsed) ? defaultValue : parsed;
};

interface Environment {
  PORT: number | undefined;
  DB_URI: string | undefined;
  CORS_ORIGIN: string | undefined;
}

export const environment: Environment = {
  PORT: safeParseInt(process.env.PORT, 3002),
  DB_URI: process.env.MONGODB_URI || constructMongoDBUri(),
  CORS_ORIGIN: process.env.CORS_ORIGIN,
};
