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
  static async removeStoreFromProducts(storeId) {
    try {
      const endpoint = ProxyService.buildEndpoint(microservices.products.endpoints.removeStoreFromAll, {
        storeId,
      });
      const result = await ProxyService.forwardRequest("products", endpoint, "DELETE", null, {}, null);

      return result;
    } catch (error) {
      console.error(`Erreur lors de la suppression du store ${storeId} des produits:`, error);
    }
  }
}

module.exports = ProductService;
