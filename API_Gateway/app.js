const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { PORT, DB_URI, CORS_ORIGIN } = require("./src/config/environment");

const authRoutes = require("./src/auth/routes/authRoutes");
const productRoutes = require("./src/api/routes/productRoutes");
const cartRoutes = require("./src/api/routes/cartRoutes");
const orderRoutes = require("./src/api/routes/orderRoutes");

const app = express();

app.use(express.json());

app.use(
  cors({
    origin: CORS_ORIGIN,
    credentials: true,
  })
);

mongoose
  .connect(DB_URI)
  .then(() => console.log("Connecté à MongoDB"))
  .catch((err) => console.error("Erreur de connexion à MongoDB:", err));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/carts", cartRoutes);
app.use("/api/orders", orderRoutes);

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
