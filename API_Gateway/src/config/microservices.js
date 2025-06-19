module.exports = {
  products: {
    url: process.env.PRODUCT_SERVICE_URL || "http://localhost:3001",
    endpoints: {
      list: "/products",
      detail: "/products/:id",
      create: "/products",
      update: "/products/:id",
      delete: "/products/:id",
    },
  },
};
