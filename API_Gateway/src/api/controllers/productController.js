const ProxyService = require("../service/proxyService");
const InventoryService = require("../service/inventoryService");
const ProductInventoryService = require("../service/productInventoryService");
const { products } = require("../../config/microservices");
const ProductService = require("../service/productService");

class ProductController {
  static async getAllProducts(req, res) {
    try {
      const result = await ProxyService.forwardRequest(
        "products",
        products.endpoints.list,
        "GET",
        null,
        {},
        null,
        req.query
      );

      const enrichedResult = await ProductInventoryService.enrichProductsWithInventoryAndUpdatePagination(
        result.products,
        result
      );
      const productsWithStoreNames = await ProductService.enrichProductsWithStoreNames(enrichedResult.products);

      res.json({
        ...enrichedResult,
        products: productsWithStoreNames,
      });
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  static async getMyProducts(req, res) {
    try {
      const result = await ProxyService.forwardRequest(
        "products",
        products.endpoints.myProducts,
        "GET",
        null,
        {},
        req.user
      );

      const enrichedProducts = await ProductInventoryService.enrichProductsWithInventory(result);
      const productsWithStoreNames = await ProductService.enrichProductsWithStoreNames(enrichedProducts);

      res.json(productsWithStoreNames);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  static async getProductById(req, res) {
    try {
      const result = await ProductService.getProductById(req.params.id);
      const enrichedProduct = await ProductInventoryService.enrichProductWithInventory(result);

      res.json(enrichedProduct);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  static async createProduct(req, res) {
    try {
      const productData = {
        ...req.body,
        storeId: req.user.store ? req.user.store : null,
      };

      const result = await ProxyService.forwardRequest(
        "products",
        products.endpoints.create,
        "POST",
        productData,
        {},
        req.user
      );

      if (result.createInventory) {
        try {
          await InventoryService.createInventoryItem(result.createInventory.storeId, {
            productId: result.createInventory.productId,
            productName: result.createInventory.productName,
            quantity: productData.totalInventory,
          });
        } catch (inventoryError) {
          console.error("Erreur création inventaire:", inventoryError);
        }
      }

      res.status(201).json(result.product);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  static async updateProduct(req, res) {
    try {
      const endpoint = ProxyService.buildEndpoint(products.endpoints.update, { id: req.params.id });
      const result = await ProxyService.forwardRequest("products", endpoint, "PUT", req.body, {}, req.user);
      ProductInventoryService.invalidateProductCache(req.params.id);

      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  static async deleteProduct(req, res) {
    try {
      const endpoint = ProxyService.buildEndpoint(products.endpoints.delete, { id: req.params.id });
      const result = await ProxyService.forwardRequest("products", endpoint, "DELETE", null, {}, req.user);

      if (result.storeToClean) {
        try {
          const storesToClean = Array.isArray(result.storeToClean) ? result.storeToClean : [result.storeToClean];

          const cleanupPromises = storesToClean.map(async (storeId) => {
            try {
              await InventoryService.deleteInventoryItem(storeId, req.params.id);
            } catch (storeInventoryError) {
              console.error(`Erreur nettoyage inventaire store ${storeId}:`, storeInventoryError);
            }
          });

          await Promise.all(cleanupPromises);
        } catch (inventoryError) {
          console.error("Erreur nettoyage inventaire:", inventoryError);
        }
      }

      ProductInventoryService.invalidateProductCache(req.params.id);

      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  static async addStoreToProduct(req, res) {
    try {
      const endpoint = ProxyService.buildEndpoint(products.endpoints.addStore, { id: req.params.id });
      const result = await ProxyService.forwardRequest("products", endpoint, "POST", req.body, {}, req.user);

      ProductInventoryService.invalidateProductCache(req.params.id);

      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  static async removeStoreFromProduct(req, res) {
    try {
      const endpoint = ProxyService.buildEndpoint(products.endpoints.removeStore, { id: req.params.id });
      const result = await ProxyService.forwardRequest("products", endpoint, "DELETE", null, {}, req.user);

      ProductInventoryService.invalidateProductCache(req.params.id);

      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  static async getAllCategories(req, res) {
    try {
      const result = await ProxyService.forwardRequest("products", products.endpoints.categories, "GET");
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  static async getCategoryNames(req, res) {
    try {
      const result = await ProxyService.forwardRequest("products", products.endpoints.categoryNames, "GET");
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  static async createCategory(req, res) {
    try {
      const result = await ProxyService.forwardRequest(
        "products",
        products.endpoints.categoryCreate,
        "POST",
        req.body,
        {},
        req.user
      );
      res.status(201).json(result);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  static async updateCategory(req, res) {
    try {
      const endpoint = ProxyService.buildEndpoint(products.endpoints.categoryUpdate, {
        id: req.params.id,
      });
      const result = await ProxyService.forwardRequest("products", endpoint, "PUT", req.body, {}, req.user);
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  static async deleteCategory(req, res) {
    try {
      const endpoint = ProxyService.buildEndpoint(products.endpoints.categoryDelete, {
        id: req.params.id,
      });
      const result = await ProxyService.forwardRequest("products", endpoint, "DELETE", null, {}, req.user);
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  static async uploadImage(req, res) {
    try {
      const result = await ProxyService.forwardFileUpload(
        "products",
        products.endpoints.uploadImage,
        req,
        res,
        req.user
      );
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  static async uploadMultipleImages(req, res) {
    try {
      const result = await ProxyService.forwardFileUpload(
        "products",
        products.endpoints.uploadImages,
        req,
        res,
        req.user
      );
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  static async deleteImage(req, res) {
    try {
      const result = await ProxyService.forwardRequest(
        "products",
        products.endpoints.deleteImage,
        "DELETE",
        req.body,
        {},
        req.user
      );
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }
}

module.exports = ProductController;
