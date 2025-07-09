const ProxyService = require("../service/proxyService");
const { orders } = require("../../config/microservices");
const CartService = require("../service/CartService");
const OrderService = require("../service/orderService");
const InventoryService = require("../service/inventoryService");

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
      const endpoint = ProxyService.buildEndpoint(orders.endpoints.getOrderById, { id: req.params.id });
      const result = await ProxyService.forwardRequest("orders", endpoint, "GET");
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  static async getOrderGroupById(req, res) {
    try {
      const endpoint = ProxyService.buildEndpoint(orders.endpoints.getOrderGroupById, { id: req.params.id });
      const result = await ProxyService.forwardRequest("orders", endpoint, "GET");
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  static async getStoreOrders(req, res) {
    try {
      const result = await ProxyService.forwardRequest(
        "orders",
        orders.endpoints.storeOrders,
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
      const { userAddress } = req.body;

      if (!userAddress || !userAddress.street || !userAddress.city || !userAddress.postalCode || !userAddress.country) {
        return res.status(400).json({
          error: "Adresse utilisateur complète requise (street, city, postalCode, country)",
        });
      }

      const cart = await CartService.getCartData(req.user);

      if (!cart || !cart.items || cart.items.length === 0) {
        return res.status(400).json({ error: "Panier vide" });
      }

      const enrichedCart = await OrderService.enrichCartWithNewStructure(cart, req.user.userId, userAddress);

      const result = await ProxyService.forwardRequest(
        "orders",
        orders.endpoints.createCheckout,
        "POST",
        {
          cart: enrichedCart,
        },
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
        if (result.inventoryUpdates && Array.isArray(result.inventoryUpdates) && result.inventoryUpdates.length > 0) {
          for (const update of result.inventoryUpdates) {
            await InventoryService.decrementInventoryItem(update.storeId, update.productId, update.quantity);
          }
        }
        await CartService.clearCartData(req.user);
      }

      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ error: error.message });
    }
  }
}

module.exports = OrderController;
