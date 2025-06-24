import { Request, Response } from "express";
import { ProductService } from "../services/productService";

interface AuthRequest extends Request {
  user?: { userId: string; role: string };
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
      const userId = req.user?.userId;
      const result = await ProductService.getMyProducts(userId!);
      res.json(result);
    } catch (err: any) {
      console.error("Erreur getMyProducts:", err);
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
      const result = await ProductService.deleteProduct(req.params.id, userId!, userRole);
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
}

export const productController = new ProductController();
