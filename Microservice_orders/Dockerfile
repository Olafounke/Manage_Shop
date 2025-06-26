FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

# Installer toutes les dépendances (dev + prod)
RUN npm ci

COPY . .

# Build TypeScript
RUN npm run build

# Supprimer les dépendances de développement
RUN npm prune --production

EXPOSE 3002

CMD ["npm", "start"] 