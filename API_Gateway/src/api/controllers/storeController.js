const ProxyService = require("../service/proxyService");
const { stores } = require("../../config/microservices");
const { exec } = require("child_process");
const path = require("path");
const StoreService = require("../service/storeService");

class StoreController {
  static async getAllStores(req, res) {
    try {
      const stores = await StoreService.getAllStores();

      return res.status(200).json(stores);
    } catch (error) {
      console.error("Erreur dans getAllStores:", error);
      return res.status(500).json({
        success: false,
        error: "Erreur lors de la récupération des stores",
        details: error.message,
      });
    }
  }

  static async getStoreById(req, res) {
    try {
      const storeId = req.params.storeId;
      const result = await StoreService.getStoreById(storeId);
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  static async createStore(req, res) {
    try {
      let { storeName, storeAddress, userId } = req.body;

      if (!storeName || !storeAddress) {
        return res.status(400).json({
          error: "Les paramètres StoreName et StoreAddress sont requis",
        });
      }

      if (!userId) {
        userId = null;
      }
      const result = await StoreService.createStore(storeName, storeAddress, userId);

      if (result.success) {
        return res.status(201).json({
          message: result.message,
          scriptOutput: result.scriptOutput,
        });
      } else {
        return res.status(400).json({
          error: result.error,
          details: result.details,
        });
      }
    } catch (error) {
      console.error("Erreur dans createStore:", error);
      return res.status(500).json({
        error: "Erreur interne du serveur",
        details: error.message,
      });
    }
  }

  static async updateStoreById(req, res) {
    try {
      const storeId = req.params.storeId;
      let { storeName, storeAddress, userId } = req.body;
      console.log("userId", userId);
      if (!userId) {
        userId = null;
      }
      const result = await StoreService.updateStoreById(storeId, storeName, storeAddress, userId);
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  static async deleteStoreById(req, res) {
    try {
      const storeId = req.params.storeId;
      const result = await StoreService.deleteStoreById(storeId);
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }
}

module.exports = StoreController;
