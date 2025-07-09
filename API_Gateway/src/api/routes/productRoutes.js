const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/productController");
const authMiddleware = require("../../auth/middleware/authMiddleware");
const multer = require("multer");

// Configuration multer pour l'upload de fichiers
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Seules les images sont autorisées"));
    }
  },
});

// Routes d'upload d'images
router.post(
  "/upload-image",
  authMiddleware.authenticate,
  authMiddleware.checkRole(["ADMIN_STORE", "SUPER_ADMIN"]),
  upload.single("image"),
  ProductController.uploadImage
);

router.post(
  "/upload-images",
  authMiddleware.authenticate,
  authMiddleware.checkRole(["ADMIN_STORE", "SUPER_ADMIN"]),
  upload.array("images", 10),
  ProductController.uploadMultipleImages
);

router.delete(
  "/delete-image",
  authMiddleware.authenticate,
  authMiddleware.checkRole(["ADMIN_STORE", "SUPER_ADMIN"]),
  ProductController.deleteImage
);

// Routes existantes
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
