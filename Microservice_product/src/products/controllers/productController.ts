import { Request, Response } from "express";
import { ProductService } from "../services/productService";
import { ImageService } from "../services/imageService";
import upload from "../../middleware/uploadMiddleware";

interface AuthRequest extends Request {
  user?: { userId: string; role: string; store: string };
}

export class ProductController {
  public async getAllProducts(req: Request, res: Response): Promise<void> {
    try {
      const result = await ProductService.getAllProducts(req.query);
      res.json(result);
    } catch (err: any) {
      console.error("Erreur getProducts:", err);
      res.status(500).json({ error: "Erreur serveur." });
    }
  }

  public async getMyProducts(req: AuthRequest, res: Response): Promise<void> {
    try {
      console.log("[ProductController-MS] Début de getMyProducts");
      console.log("[ProductController-MS] User info:", req.user);

      const userId = req.user?.userId;
      console.log("[ProductController-MS] User ID extrait:", userId);

      const result = await ProductService.getMyProducts(userId!);
      console.log("[ProductController-MS] Résultat du service:", result);
      console.log(
        "[ProductController-MS] Nombre de produits retournés:",
        Array.isArray(result) ? result.length : "Non array"
      );

      res.json(result);
    } catch (err: any) {
      console.error("[ProductController-MS] Erreur getMyProducts:", err);
      console.error("[ProductController-MS] Stack trace:", err.stack);
      if (err.message === "Utilisateur non authentifié.") {
        res.status(401).json({ error: err.message });
      } else {
        res.status(500).json({ error: "Erreur serveur." });
      }
    }
  }

  public async getProductById(req: Request, res: Response): Promise<void> {
    try {
      const product = await ProductService.getProductById(req.params.id);
      res.json(product);
    } catch (err: any) {
      if (err.message === "Produit non trouvé.") {
        res.status(404).json({ error: err.message });
      } else {
        res.status(400).json({ error: "ID invalide." });
      }
    }
  }

  public async createProduct(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const product = await ProductService.createProduct(req.body, userId!);
      res.status(201).json(product);
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  }

  public async updateProduct(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      const product = await ProductService.updateProduct(req.params.id, req.body, userId!, userRole);
      res.json(product);
    } catch (err: any) {
      if (err.message === "Produit non trouvé.") {
        res.status(404).json({ error: err.message });
      } else if (err.message === "Non autorisé à modifier ce produit.") {
        res.status(403).json({ error: err.message });
      } else {
        res.status(400).json({ error: err.message });
      }
    }
  }

  public async deleteProduct(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;
      const userRole = req.user?.role;
      const storeId = req.user?.store;
      const result = await ProductService.deleteProduct(req.params.id, userId!, userRole, storeId);
      res.json(result);
    } catch (err: any) {
      if (err.message === "Produit non trouvé.") {
        res.status(404).json({ error: err.message });
      } else if (err.message === "Non autorisé à supprimer ce produit.") {
        res.status(403).json({ error: err.message });
      } else {
        res.status(400).json({ error: "Erreur lors de la suppression." });
      }
    }
  }

  public async addStoreToProduct(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { storeId } = req.body;
      const productId = req.params.id;

      if (!storeId) {
        res.status(400).json({ error: "StoreId requis." });
        return;
      }

      const result = await ProductService.addStoreToProduct(productId, storeId);
      res.json({
        message: "Store ajouté au produit avec succès.",
        product: result,
      });
    } catch (err: any) {
      if (err.message === "Produit non trouvé.") {
        res.status(404).json({ error: err.message });
      } else {
        res.status(400).json({ error: err.message });
      }
    }
  }

  public async removeStoreFromProduct(req: AuthRequest, res: Response): Promise<void> {
    try {
      const storeId = req.user?.store;
      const productId = req.params.id;

      if (!storeId) {
        res.status(400).json({ error: "StoreId requis." });
        return;
      }

      const result = await ProductService.removeStoreFromProduct(productId, storeId);

      if (result.deleted) {
        res.json({
          message: "Produit supprimé car plus aucun store ni owner.",
          deleted: true,
        });
      } else {
        res.json({
          message: "Store retiré du produit avec succès.",
          product: result.product,
        });
      }
    } catch (err: any) {
      if (err.message === "Produit non trouvé.") {
        res.status(404).json({ error: err.message });
      } else {
        res.status(400).json({ error: err.message });
      }
    }
  }

  public async removeStoreFromAllProducts(req: Request, res: Response): Promise<void> {
    try {
      const storeId = req.params.storeId;

      if (!storeId) {
        res.status(400).json({ error: "StoreId requis dans les paramètres." });
        return;
      }

      const result = await ProductService.removeStoreFromAllProducts(storeId);

      res.json({
        message: `Store ${storeId} supprimé de tous les produits avec succès.`,
        modifiedCount: result.modifiedCount,
        deletedCount: result.deletedCount,
      });
    } catch (err: any) {
      console.error("Erreur removeStoreFromAllProducts:", err);
      res.status(500).json({ error: "Erreur lors de la suppression du store des produits." });
    }
  }

  public async uploadImage(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.file) {
        res.status(400).json({ error: "Aucun fichier fourni" });
        return;
      }

      const imageUrl = await ImageService.uploadImage(req.file);
      res.json({ url: imageUrl });
    } catch (error: any) {
      console.error("Erreur lors de l'upload de l'image:", error);
      res.status(500).json({ error: error.message });
    }
  }

  public async deleteImage(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { imageUrl } = req.body;

      if (!imageUrl) {
        res.status(400).json({ error: "URL de l'image manquante" });
        return;
      }

      await ImageService.deleteImage(imageUrl);
      res.json({ message: "Image supprimée avec succès" });
    } catch (error: any) {
      console.error("Erreur lors de la suppression de l'image:", error);
      res.status(500).json({ error: error.message });
    }
  }

  public async uploadMultipleImages(req: AuthRequest, res: Response): Promise<void> {
    try {
      if (!req.files || req.files.length === 0) {
        res.status(400).json({ error: "Aucun fichier fourni" });
        return;
      }

      const uploadPromises = (req.files as Express.Multer.File[]).map((file) => ImageService.uploadImage(file));

      const imageUrls = await Promise.all(uploadPromises);
      res.json({ urls: imageUrls });
    } catch (error: any) {
      console.error("Erreur lors de l'upload des images:", error);
      res.status(500).json({ error: error.message });
    }
  }
}

export const productController = new ProductController();
