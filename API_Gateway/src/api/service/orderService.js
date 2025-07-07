const ProxyService = require("./proxyService");
const InventoryService = require("./inventoryService");
const GeolocationService = require("./geolocationService");
const ProductController = require("../controllers/productController");
const { products } = require("../../config/microservices");
const ProductService = require("./productService");

class OrderService {
  static async enrichCartWithNewStructure(cart, userId, userAddress) {
    try {
      const fullAddress = `${userAddress.street}, ${userAddress.city}, ${userAddress.postalCode}, ${userAddress.country}`;
      const userCoordinates = await GeolocationService.geocodeAddress(fullAddress);

      const enrichedItems = [];
      const storeDataMap = new Map();

      for (const item of cart.items) {
        const productData = await ProductService.getProductById(item.product);

        if (!productData || !productData.stores || productData.stores.length === 0) {
          throw new Error(`Produit ${item.product} non disponible dans aucun magasin`);
        }

        const stores = [];

        for (const storeId of productData.stores) {
          try {
            let storeInfo;
            if (storeDataMap.has(storeId)) {
              storeInfo = storeDataMap.get(storeId);
            } else {
              const StoreService = require("./storeService");
              storeInfo = await StoreService.getStoreById(storeId);
              storeDataMap.set(storeId, storeInfo);
            }

            let quantityAvailable = 0;
            try {
              const inventoryData = await InventoryService.getInventoryItemById(storeId, item.product);
              quantityAvailable = inventoryData?.quantity || 0;
            } catch (inventoryError) {
              console.warn(`Pas d'inventaire trouvé pour produit ${item.product} dans store ${storeId}`);
              quantityAvailable = 0;
            }

            if (quantityAvailable > 0) {
              stores.push({
                storeId: storeId,
                storeName: storeInfo.storeName,
                storeAdress: {
                  longitude: storeInfo.longitude,
                  latitude: storeInfo.latitude,
                },
                quantityAvailable: quantityAvailable,
              });
            }
          } catch (storeError) {
            console.error(`Erreur récupération données store ${storeId}:`, storeError);
          }
        }

        if (stores.length === 0) {
          throw new Error(`Produit ${productData.name} non disponible en stock dans aucun magasin`);
        }

        enrichedItems.push({
          productId: item.product,
          productName: productData.name,
          quantity: item.quantity,
          price: item.price,
          stores: stores,
        });
      }

      return {
        owner: userId,
        userAdress: {
          fullAddress: fullAddress,
          longitude: userCoordinates.longitude,
          latitude: userCoordinates.latitude,
        },
        items: enrichedItems,
        total: cart.total,
      };
    } catch (error) {
      console.error("Erreur lors de l'enrichissement du cart:", error);
      throw new Error(`Impossible d'enrichir les données du panier: ${error.message}`);
    }
  }

  static async cancelStoreOrders(storeId) {
    try {
      const endpoint = ProxyService.buildEndpoint(microservices.orders.endpoints.cancelByStore, {
        storeId,
      });
      const result = await ProxyService.forwardRequest("orders", endpoint, "PUT");

      return result;
    } catch (error) {
      console.error(`Erreur lors de l'annulation des commandes pour le store ${storeId}:`, error);
    }
  }
}

module.exports = OrderService;
