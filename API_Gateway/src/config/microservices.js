const {
  PRODUCT_SERVICE_URL,
  CART_SERVICE_URL,
  ORDER_SERVICE_URL,
  STORE_SERVICE_URL,
  TRANSFERT_SERVICE_URL,
} = require("./environment");

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
      addStore: "/products/:id/stores",
      removeStore: "/products/:id/stores",
      removeStoreFromAll: "/products/stores/:storeId",
      categories: "/categories",
      categoryNames: "/categories/names",
      categoryCreate: "/categories",
      categoryUpdate: "/categories/:id",
      categoryDelete: "/categories/:id",
      uploadImage: "/products/upload-image",
      uploadImages: "/products/upload-images",
      deleteImage: "/products/delete-image",
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
      getOrderById: "/orders/:id/order",
      getOrderGroupById: "/orders/:id/groupOrder",
      storeOrders: "/orders/admin",
      createCheckout: "/orders/checkout",
      updateStatus: "/orders/:id/status",
      verifyPayment: "/orders/verify-payment/:sessionId",
      cancelByStore: "/orders/stores/:storeId/cancel",
    },
  },
  stores: {
    baseUrl: STORE_SERVICE_URL,
    endpoints: {
      getStoreById: "/api/store",
      updateStoreById: "/api/store",
      inventory: "/api/inventory",
      inventoryItem: "/api/inventory/:id",
      createInventory: "/api/inventory",
      updateInventory: "/api/inventory/:id",
      deleteInventory: "/api/inventory/:id",
    },
  },
  transferts: {
    url: TRANSFERT_SERVICE_URL,
    endpoints: {
      create: "/transfert",
      getByStore: "/transfert/store/:storeId",
      accept: "/transfert/:id/accept",
      reject: "/transfert/:id/reject",
    },
  },
};
