const mongoose = require("mongoose");
const { USERS_DB_URI, STORES_DB_URI } = require("./environment");

const userConnection = mongoose.createConnection(USERS_DB_URI);
userConnection
  .asPromise()
  .then(() => console.log("Connecté à MongoDB (Users)"))
  .catch((err) => console.error("Erreur de connexion à MongoDB Users:", err));

const storeConnection = mongoose.createConnection(STORES_DB_URI);
storeConnection
  .asPromise()
  .then(() => console.log("Connecté à MongoDB (Stores)"))
  .catch((err) => console.error("Erreur de connexion à MongoDB Stores:", err));

module.exports = {
  userConnection,
  storeConnection,
};
