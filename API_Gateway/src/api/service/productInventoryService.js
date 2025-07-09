const InventoryService = require("./inventoryService");

class ProductInventoryService {
  static inventoryCache = new Map();
  static CACHE_DURATION = 30 * 1000; // 30 secondes

  static async enrichProductWithInventory(product) {
    const totalInventory = await this.getProductTotalInventory(product._id, product.stores || []);
    return {
      ...product,
      totalInventory,
      inStock: totalInventory > 0,
    };
  }

  static async enrichProductsWithInventory(products) {
    const enrichedProducts = await Promise.all(
      products.map(async (product) => {
        return await this.enrichProductWithInventory(product);
      })
    );

    return enrichedProducts.filter((product) => product.inStock === true);
  }

  static async enrichProductsWithInventoryAndUpdatePagination(products, paginationData) {
    const enrichedProducts = await this.enrichProductsWithInventory(products);

    const filteredTotal = enrichedProducts.length;
    const limit = paginationData.limit;
    const currentPage = paginationData.page;
    const recalculatedTotalPages = Math.ceil(filteredTotal / limit);

    return {
      products: enrichedProducts,
      total: filteredTotal,
      page: currentPage,
      limit: limit,
      totalPages: recalculatedTotalPages,
    };
  }

  static async getProductTotalInventory(productId, storeIds = []) {
    const cacheKey = `${productId}_${storeIds.join(",")}`;
    const cached = this.inventoryCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
      return cached.inventory;
    }

    this.clearExpiredCache();

    try {
      let totalInventory = 0;

      const inventoryPromises = storeIds.map(async (storeId) => {
        try {
          const productInventory = await InventoryService.getInventoryItemById(storeId, productId);
          return productInventory ? productInventory.quantity : 0;
        } catch (error) {
          console.error(`Erreur inventaire store ${storeId}:`, error);
          return 0;
        }
      });

      const inventories = await Promise.all(inventoryPromises);
      totalInventory = inventories.reduce((sum, qty) => sum + qty, 0);

      this.inventoryCache.set(cacheKey, {
        inventory: totalInventory,
        timestamp: Date.now(),
      });

      return totalInventory;
    } catch (error) {
      console.error(`Erreur calcul inventaire total pour produit ${productId}:`, error);
      return 0;
    }
  }

  static invalidateProductCache(productId) {
    for (const [key] of this.inventoryCache.entries()) {
      if (key.startsWith(`${productId}_`)) {
        this.inventoryCache.delete(key);
      }
    }
  }

  static clearExpiredCache() {
    const now = Date.now();
    for (const [key, value] of this.inventoryCache.entries()) {
      if (now - value.timestamp > this.CACHE_DURATION) {
        this.inventoryCache.delete(key);
      }
    }
  }
}

module.exports = ProductInventoryService;
