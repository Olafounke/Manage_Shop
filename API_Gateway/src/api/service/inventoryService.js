const microservices = require("../../config/microservices");
const ProxyService = require("./proxyService");

class InventoryService {
  static async getInventoryByStoreId(storeId) {
    try {
      const StoreService = require("./storeService");
      const store = await StoreService.getStoreById(storeId);
      const { port } = await StoreService.getStorePort(storeId);

      const result = await ProxyService.forwardRequest(
        "stores",
        microservices.stores.endpoints.inventory,
        "GET",
        null,
        {},
        null,
        null,
        port,
        store.nameSlug
      );

      return result;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'inventaire du store ${storeId}:`, error);
      throw new Error(`Impossible de récupérer l'inventaire: ${error.message}`);
    }
  }

  static async getInventoryItemById(storeId, itemId) {
    try {
      const StoreService = require("./storeService");
      const store = await StoreService.getStoreById(storeId);
      console.log(store);
      const { port } = await StoreService.getStorePort(storeId);
      const endpoint = ProxyService.buildEndpoint(microservices.stores.endpoints.inventoryItem, { id: itemId });

      const result = await ProxyService.forwardRequest(
        "stores",
        endpoint,
        "GET",
        null,
        {},
        null,
        null,
        port,
        store.nameSlug
      );

      return result;
    } catch (error) {
      console.error(`Erreur lors de la récupération de l'article ${itemId} du store ${storeId}:`, error);
      throw new Error(`Impossible de récupérer l'article d'inventaire: ${error.message}`);
    }
  }

  static async createInventoryItem(storeId, itemData) {
    try {
      if (!itemData.productId) {
        throw new Error("Le productId est requis pour créer un article d'inventaire");
      }
      if (typeof itemData.quantity !== "number" || itemData.quantity < 0) {
        throw new Error("La quantité doit être un nombre positif");
      }
      const StoreService = require("./storeService");
      const store = await StoreService.getStoreById(storeId);
      const { port } = await StoreService.getStorePort(storeId);

      const result = await ProxyService.forwardRequest(
        "stores",
        microservices.stores.endpoints.createInventory,
        "POST",
        itemData,
        {},
        null,
        null,
        port,
        store.nameSlug
      );

      return result;
    } catch (error) {
      console.error(`Erreur lors de la création de l'article d'inventaire dans le store ${storeId}:`, error);
      throw new Error(`Impossible de créer l'article d'inventaire: ${error.message}`);
    }
  }

  static async updateInventoryItem(storeId, itemId, itemData) {
    try {
      if (itemData.operation) {
        if (!["increment", "decrement"].includes(itemData.operation)) {
          throw new Error("L'opération doit être 'increment' ou 'decrement'");
        }
        if (typeof itemData.quantity !== "number" || itemData.quantity <= 0) {
          throw new Error("La quantité doit être un nombre positif pour les opérations increment/decrement");
        }
      } else if (itemData.quantity !== undefined) {
        if (typeof itemData.quantity !== "number" || itemData.quantity < 0) {
          throw new Error("La quantité doit être un nombre positif");
        }
      }

      const StoreService = require("./storeService");
      const store = await StoreService.getStoreById(storeId);
      const { port } = await StoreService.getStorePort(storeId);
      const endpoint = ProxyService.buildEndpoint(microservices.stores.endpoints.updateInventory, { id: itemId });

      const result = await ProxyService.forwardRequest(
        "stores",
        endpoint,
        "PUT",
        itemData,
        {},
        null,
        null,
        port,
        store.nameSlug
      );

      return result;
    } catch (error) {
      console.error(`Erreur lors de la mise à jour de l'article ${itemId} dans le store ${storeId}:`, error);
      throw new Error(`Impossible de mettre à jour l'article d'inventaire: ${error.message}`);
    }
  }

  static async deleteInventoryItem(storeId, itemId) {
    try {
      const StoreService = require("./storeService");
      const store = await StoreService.getStoreById(storeId);
      const { port } = await StoreService.getStorePort(storeId);
      const endpoint = ProxyService.buildEndpoint(microservices.stores.endpoints.deleteInventory, { id: itemId });

      const result = await ProxyService.forwardRequest(
        "stores",
        endpoint,
        "DELETE",
        null,
        {},
        null,
        null,
        port,
        store.nameSlug
      );

      return result;
    } catch (error) {
      console.error(`Erreur lors de la suppression de l'article ${itemId} dans le store ${storeId}:`, error);
      throw new Error(`Impossible de supprimer l'article d'inventaire: ${error.message}`);
    }
  }

  static async incrementInventoryItem(storeId, itemId, productName, quantity) {
    try {
      await this.getInventoryItemById(storeId, itemId);

      return this.updateInventoryItem(storeId, itemId, {
        operation: "increment",
        quantity: quantity,
      });
    } catch (error) {
      console.log(
        `L'item ${itemId} n'existe pas dans l'inventaire du store ${storeId}, création d'un nouvel item avec quantité ${quantity}`
      );

      const inventoryResult = await this.createInventoryItem(storeId, {
        productId: itemId,
        productName: productName,
        quantity: quantity,
      });

      try {
        const ProductService = require("./productService");
        await ProductService.addStoreToProduct(itemId, storeId);
        console.log(`Store ${storeId} ajouté au produit ${itemId}`);
      } catch (productError) {
        console.error(`Erreur lors de l'ajout du store ${storeId} au produit ${itemId}:`, productError);
      }

      return inventoryResult;
    }
  }

  static async decrementInventoryItem(storeId, itemId, quantity) {
    return this.updateInventoryItem(storeId, itemId, {
      operation: "decrement",
      quantity: quantity,
    });
  }
}

module.exports = InventoryService;
