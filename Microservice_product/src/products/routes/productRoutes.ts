import express from "express";
import { productController } from "../controllers/productController";
import { extractUserFromHeader } from "../middleware/userExtractor";
import { upload, uploadFromGateway } from "../../middleware/uploadMiddleware";

const router = express.Router();

// Routes d'upload d'images (pour les fichiers venant de l'API Gateway)
router.post("/upload-image", extractUserFromHeader, uploadFromGateway.single("image"), productController.uploadImage);
router.post(
  "/upload-images",
  extractUserFromHeader,
  uploadFromGateway.array("images", 10),
  productController.uploadMultipleImages
);
router.delete("/delete-image", extractUserFromHeader, productController.deleteImage);

// Routes existantes
router.get("/", productController.getAllProducts);
router.get("/my-products", extractUserFromHeader, productController.getMyProducts);
router.get("/:id", productController.getProductById);
router.post("/", extractUserFromHeader, productController.createProduct);
router.put("/:id", extractUserFromHeader, productController.updateProduct);
router.delete("/:id", extractUserFromHeader, productController.deleteProduct);
router.post("/:id/stores", extractUserFromHeader, productController.addStoreToProduct);
router.delete("/:id/stores", extractUserFromHeader, productController.removeStoreFromProduct);
router.delete("/stores/:storeId", productController.removeStoreFromAllProducts);

export default router;
