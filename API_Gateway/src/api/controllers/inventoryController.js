const InventoryService = require("../service/inventoryService");

class InventoryController {
  static async getInventoryByStoreId(req, res) {
    try {
      const storeId = req.params.storeId;
      const result = await InventoryService.getInventoryByStoreId(storeId);
      res.json(result);
    } catch (error) {
      console.error(`Erreur dans getInventoryByStoreId pour le store ${req.params.storeId}:`, error);
      res.status(error.status || 500).json({
        error: error.message,
      });
    }
  }
  static async getInventoryItem(req, res) {
    try {
      const storeId = req.params.storeId;
      const itemId = req.params.id;
      const result = await InventoryService.getInventoryItemById(storeId, itemId);
      res.json(result);
    } catch (error) {
      console.error(
        `Erreur dans getInventoryItem pour l'article ${req.params.id} du store ${req.params.storeId}:`,
        error
      );
      res.status(error.status || 500).json({
        error: error.message,
      });
    }
  }

  static async createInventoryItem(req, res) {
    try {
      const storeId = req.params.storeId;
      const { productId, quantity } = req.body;
      const result = await InventoryService.createInventoryItem(storeId, productId, quantity);
      res.status(201).json(result);
    } catch (error) {
      console.error(`Erreur dans createInventoryItem pour le store ${req.params.storeId}:`, error);
      res.status(error.status || 400).json({
        error: error.message,
      });
    }
  }

  static async updateInventoryItem(req, res) {
    try {
      const storeId = req.params.storeId;
      const itemId = req.params.id;
      const result = await InventoryService.updateInventoryItem(storeId, itemId, req.body);
      res.json(result);
    } catch (error) {
      console.error(
        `Erreur dans updateInventoryItem pour l'article ${req.params.id} du store ${req.params.storeId}:`,
        error
      );
      res.status(error.status || 400).json({
        error: error.message,
      });
    }
  }

  static async deleteInventoryItem(req, res) {
    try {
      const storeId = req.params.storeId;
      const itemId = req.params.id;
      const result = await InventoryService.deleteInventoryItem(storeId, itemId);
      res.json(result);
    } catch (error) {
      console.error(
        `Erreur dans deleteInventoryItem pour l'article ${req.params.id} du store ${req.params.storeId}:`,
        error
      );
      res.status(error.status || 500).json({
        error: error.message,
      });
    }
  }

  static async incrementInventoryItem(req, res) {
    try {
      const storeId = req.params.storeId;
      const itemId = req.params.id;
      const { quantity } = req.body;

      if (!operation || !quantity || typeof quantity !== "number" || quantity <= 0) {
        return res.status(400).json({
          error: "Une quantité positive est requise",
        });
      }

      const result = await InventoryService.incrementInventoryItem(storeId, itemId, quantity);
      res.json(result);
    } catch (error) {
      console.error(
        `Erreur dans incrementInventoryItem pour l'article ${req.params.id} du store ${req.params.storeId}:`,
        error
      );
      res.status(error.status || 400).json({
        error: error.message,
      });
    }
  }

  static async decrementInventoryItem(req, res) {
    try {
      const storeId = req.params.storeId;
      const itemId = req.params.id;
      const { quantity } = req.body;

      if (!quantity || typeof quantity !== "number" || quantity <= 0) {
        return res.status(400).json({
          error: "Une quantité positive est requise",
          storeId,
          itemId,
        });
      }

      const result = await InventoryService.decrementInventoryItem(storeId, itemId, quantity);
      res.json(result);
    } catch (error) {
      console.error(
        `Erreur dans decrementInventoryItem pour l'article ${req.params.id} du store ${req.params.storeId}:`,
        error
      );
      res.status(error.status || 400).json({
        error: error.message,
      });
    }
  }
}

module.exports = InventoryController;
