const ProxyService = require("../service/proxyService");
const { carts } = require("../../config/microservices");

class CartService {
  static async getCartData(user) {
    try {
      const result = await ProxyService.forwardRequest("carts", carts.endpoints.list, "GET", null, {}, user);
      return result;
    } catch (error) {
      throw error;
    }
  }

  static async clearCartData(user) {
    try {
      const result = await ProxyService.forwardRequest("carts", carts.endpoints.delete, "DELETE", null, {}, user);
      return result;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = CartService;
