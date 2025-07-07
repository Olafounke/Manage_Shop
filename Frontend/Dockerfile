FROM node:18-alpine

WORKDIR /Frontend

COPY package.json yarn.lock ./

RUN yarn install

COPY . .

EXPOSE 4200

CMD ["yarn", "start"]
