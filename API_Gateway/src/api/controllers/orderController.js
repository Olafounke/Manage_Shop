const ProxyService = require("../../services/proxyService");
const { orders } = require("../../config/microservices");
const CartController = require("./cartController");

class OrderController {
  static async getUserOrders(req, res) {
    try {
      const result = await ProxyService.forwardRequest("orders", orders.endpoints.list, "GET", null, {}, req.user);
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  static async getOrderById(req, res) {
    try {
      const endpoint = ProxyService.buildEndpoint(orders.endpoints.detail, { id: req.params.id });
      const result = await ProxyService.forwardRequest("orders", endpoint, "GET", null, {}, req.user);
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  static async getOrdersForStoreAdmin(req, res) {
    try {
      const result = await ProxyService.forwardRequest("orders", orders.endpoints.storeOrders, "GET");
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  static async updateOrderStatus(req, res) {
    try {
      const endpoint = ProxyService.buildEndpoint(orders.endpoints.updateStatus, { id: req.params.id });
      const result = await ProxyService.forwardRequest("orders", endpoint, "PUT", req.body);
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  static async createCheckoutSession(req, res) {
    try {
      const cart = await CartController.getCartData(req.user);
      const result = await ProxyService.forwardRequest(
        "orders",
        orders.endpoints.createCheckout,
        "POST",
        { cart },
        {},
        req.user
      );
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  static async verifyPayment(req, res) {
    try {
      const sessionId = req.params.sessionId;
      const endpoint = ProxyService.buildEndpoint(orders.endpoints.verifyPayment, { sessionId });
      const result = await ProxyService.forwardRequest("orders", endpoint, "GET");
      if (result.success) {
        await CartController.clearCartData(req.user);
      }
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }
}

module.exports = OrderController;
