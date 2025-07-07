const ProxyService = require("../service/proxyService");
const { carts } = require("../../config/microservices");
const CartService = require("../service/CartService");

class CartController {
  static async getUserCart(req, res) {
    try {
      const result = await CartService.getCartData(req.user);
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  static async addToCart(req, res) {
    try {
      const result = await ProxyService.forwardRequest(
        "carts",
        carts.endpoints.addProduct,
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

  static async updateCartItem(req, res) {
    try {
      const endpoint = ProxyService.buildEndpoint(carts.endpoints.updateProduct, { productId: req.params.productId });
      const result = await ProxyService.forwardRequest("carts", endpoint, "PUT", req.body, {}, req.user);
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  static async removeFromCart(req, res) {
    try {
      const endpoint = ProxyService.buildEndpoint(carts.endpoints.deleteProduct, { productId: req.params.productId });
      const result = await ProxyService.forwardRequest("carts", endpoint, "DELETE", null, {}, req.user);
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  static async clearCart(req, res) {
    try {
      const result = await CartService.clearCartData(req.user);
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }
}

module.exports = CartController;
