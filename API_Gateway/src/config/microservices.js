const { PRODUCT_SERVICE_URL, CART_SERVICE_URL, ORDER_SERVICE_URL } = require("./environment");

module.exports = {
  products: {
    url: PRODUCT_SERVICE_URL,
    endpoints: {
      list: "/products",
      detail: "/products/:id",
      create: "/products",
      update: "/products/:id",
      delete: "/products/:id",
      myProducts: "/products/my-products",
      categories: "/categories",
      categoryNames: "/categories/names",
      categoryCreate: "/categories",
      categoryUpdate: "/categories/:id",
      categoryDelete: "/categories/:id",
    },
  },
  carts: {
    url: CART_SERVICE_URL,
    endpoints: {
      list: "/carts",
      addProduct: "/carts/",
      updateProduct: "/carts/:productId",
      deleteProduct: "/carts/:productId",
      delete: "/carts/",
    },
  },
  orders: {
    url: ORDER_SERVICE_URL,
    endpoints: {
      list: "/orders",
      detail: "/orders/:id",
      storeOrders: "/orders/admin",
      createCheckout: "/orders/checkout",
      updateStatus: "/orders/:id/status",
      verifyPayment: "/orders/verify-payment/:sessionId",
    },
  },
};
