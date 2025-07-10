const InventoryService = require("./inventoryService");
const ProxyService = require("./proxyService");
const { products } = require("../../config/microservices");

class ProductService {
  static async getProductById(productId) {
    try {
      const endpoint = ProxyService.buildEndpoint(products.endpoints.detail, { id: productId });
      const product = await ProxyService.forwardRequest("products", endpoint, "GET");

      return product;
    } catch (error) {
      throw new Error("Erreur lors de la récupération du produit");
    }
  }

  static async addStoreToProduct(productId, storeId) {
    try {
      const endpoint = ProxyService.buildEndpoint(products.endpoints.addStore, { id: productId });
      const result = await ProxyService.forwardRequest("products", endpoint, "POST", { storeId });

      return result;
    } catch (error) {
      console.error(`Erreur lors de l'ajout du store ${storeId} au produit ${productId}:`, error);
      throw new Error(`Impossible d'ajouter le store au produit: ${error.message}`);
    }
  }

  static async removeStoreFromProducts(storeId) {
    try {
      const endpoint = ProxyService.buildEndpoint(products.endpoints.removeStoreFromAll, {
        storeId,
      });
      const result = await ProxyService.forwardRequest("products", endpoint, "DELETE", null, {}, null);

      return result;
    } catch (error) {
      console.error(`Erreur lors de la suppression du store ${storeId} des produits:`, error);
    }
  }
  static async enrichProductsWithStoreNames(products) {
    // On récupère tous les storeIds uniques
    const allStoreIds = Array.from(new Set(products.flatMap((p) => (Array.isArray(p.stores) ? p.stores : []))));
    // On fait les requêtes en parallèle
    const storeIdToName = {};
    await Promise.all(
      allStoreIds.map(async (storeId) => {
        try {
          const StoreService = require("../service/storeService");
          const store = await StoreService.getStoreById(storeId);
          storeIdToName[storeId] = store && store.name ? store.name : "";
        } catch (e) {
          storeIdToName[storeId] = "";
        }
      })
    );
    // On remplace dans chaque produit
    return products.map((p) => ({
      ...p,
      stores: Array.isArray(p.stores)
        ? p.stores.map((storeId) => ({ id: storeId, name: storeIdToName[storeId] || "" }))
        : [],
    }));
  }
}

module.exports = ProductService;
