const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/productController");
const authMiddleware = require("../../auth/middleware/authMiddleware");

router.get("/", ProductController.getAllProducts);
router.get(
  "/my-products",
  authMiddleware.authenticate,
  authMiddleware.checkRole(["ADMIN_STORE", "SUPER_ADMIN"]),
  ProductController.getMyProducts
);
router.get("/categories", ProductController.getAllCategories);
router.get("/categories/names", ProductController.getCategoryNames);
router.get("/:id", ProductController.getProductById);

router.post(
  "/",
  authMiddleware.authenticate,
  authMiddleware.checkRole(["ADMIN_STORE", "SUPER_ADMIN"]),
  ProductController.createProduct
);
router.post(
  "/categories",
  authMiddleware.authenticate,
  authMiddleware.checkRole(["SUPER_ADMIN"]),
  ProductController.createCategory
);

router.put(
  "/:id",
  authMiddleware.authenticate,
  authMiddleware.checkRole(["ADMIN_STORE", "SUPER_ADMIN"]),
  ProductController.updateProduct
);
router.put(
  "/categories/:id",
  authMiddleware.authenticate,
  authMiddleware.checkRole(["SUPER_ADMIN"]),
  ProductController.updateCategory
);

router.delete(
  "/:id",
  authMiddleware.authenticate,
  authMiddleware.checkRole(["ADMIN_STORE", "SUPER_ADMIN"]),
  ProductController.deleteProduct
);
router.delete(
  "/categories/:id",
  authMiddleware.authenticate,
  authMiddleware.checkRole(["SUPER_ADMIN"]),
  ProductController.deleteCategory
);

module.exports = router;
