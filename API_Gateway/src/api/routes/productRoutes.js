const express = require("express");
const router = express.Router();
const { authenticate } = require("../../auth/middleware/authMiddleware");
const { products } = require("../../config/microservices");
const axios = require("axios");

// Middleware pour ajouter le token au microservice
const forwardAuth = (req, res, next) => {
  if (req.headers.authorization) {
    axios.defaults.headers.common["Authorization"] = req.headers.authorization;
  }
  next();
};

// Liste des produits
router.get("/", authenticate, forwardAuth, async (req, res) => {
  try {
    const response = await axios.get(`${products.url}${products.endpoints.list}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: "Erreur serveur" });
  }
});

// Détail d'un produit
router.get("/:id", authenticate, forwardAuth, async (req, res) => {
  try {
    const response = await axios.get(`${products.url}${products.endpoints.detail.replace(":id", req.params.id)}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: "Erreur serveur" });
  }
});

// Création d'un produit
router.post("/", authenticate, forwardAuth, async (req, res) => {
  try {
    const response = await axios.post(`${products.url}${products.endpoints.create}`, req.body);
    res.status(201).json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: "Erreur serveur" });
  }
});

// Mise à jour d'un produit
router.put("/:id", authenticate, forwardAuth, async (req, res) => {
  try {
    const response = await axios.put(
      `${products.url}${products.endpoints.update.replace(":id", req.params.id)}`,
      req.body
    );
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: "Erreur serveur" });
  }
});

// Suppression d'un produit
router.delete("/:id", authenticate, forwardAuth, async (req, res) => {
  try {
    const response = await axios.delete(`${products.url}${products.endpoints.delete.replace(":id", req.params.id)}`);
    res.json(response.data);
  } catch (error) {
    res.status(error.response?.status || 500).json(error.response?.data || { message: "Erreur serveur" });
  }
});

module.exports = router;
