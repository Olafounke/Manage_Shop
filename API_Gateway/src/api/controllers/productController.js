const ProxyService = require("../../services/proxyService");
const { products } = require("../../config/microservices");

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
      res.json(result);
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
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  static async getProductById(req, res) {
    try {
      const endpoint = ProxyService.buildEndpoint(products.endpoints.detail, { id: req.params.id });
      const result = await ProxyService.forwardRequest("products", endpoint, "GET");
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  static async createProduct(req, res) {
    try {
      const result = await ProxyService.forwardRequest(
        "products",
        products.endpoints.create,
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

  static async updateProduct(req, res) {
    try {
      const endpoint = ProxyService.buildEndpoint(products.endpoints.update, { id: req.params.id });
      const result = await ProxyService.forwardRequest("products", endpoint, "PUT", req.body, {}, req.user);
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  static async deleteProduct(req, res) {
    try {
      const endpoint = ProxyService.buildEndpoint(products.endpoints.delete, { id: req.params.id });
      const result = await ProxyService.forwardRequest("products", endpoint, "DELETE", null, {}, req.user);
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
}

module.exports = ProductController;
