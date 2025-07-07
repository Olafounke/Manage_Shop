const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { PORT, USERS_DB_URI, STORES_DB_URI, CORS_ORIGIN } = require("./src/config/environment");

require("./src/config/connections");

const authRoutes = require("./src/auth/routes/authRoutes");
const productRoutes = require("./src/api/routes/productRoutes");
const cartRoutes = require("./src/api/routes/cartRoutes");
const orderRoutes = require("./src/api/routes/orderRoutes");
const storeRoutes = require("./src/api/routes/storeRoutes");
const transfertRoutes = require("./src/api/routes/transfertRoutes");

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/stores", storeRoutes);
app.use("/api/transferts", transfertRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Une erreur est survenue",
    error: err.message,
  });
});

app.use((req, res) => {
  res.status(404).json({ message: "Route non trouvée" });
});

module.exports = app;
