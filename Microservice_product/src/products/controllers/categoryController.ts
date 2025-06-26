import { Request, Response } from "express";
import { CategoryService } from "../services/categoryService";

export class CategoryController {
  public async getAllCategories(req: Request, res: Response): Promise<void> {
    try {
      const categories = await CategoryService.getAllCategories();
      res.json(categories);
    } catch (err) {
      console.error("Erreur getCategories:", err);
      res.status(500).json({ error: "Erreur serveur." });
    }
  }
  public async getCategoryNames(req: Request, res: Response): Promise<void> {
    try {
      const categoryNames = await CategoryService.getCategoryNames();
      res.json(categoryNames);
    } catch (err) {
      console.error("Erreur getCategoryNames:", err);
      res.status(500).json({ error: "Erreur serveur." });
    }
  }

  public async createCategory(req: Request, res: Response): Promise<void> {
    try {
      const category = await CategoryService.createCategory(req.body);
      res.status(201).json(category);
    } catch (err: any) {
      if (
        err.message === "Le nom de la catégorie est requis." ||
        err.message === "Une catégorie avec ce nom existe déjà."
      ) {
        res.status(400).json({ error: err.message });
      } else {
        res.status(500).json({ error: "Erreur serveur." });
      }
    }
  }

  public async updateCategory(req: Request, res: Response): Promise<void> {
    try {
      const category = await CategoryService.updateCategory(req.params.id, req.body);
      res.json(category);
    } catch (err: any) {
      if (err.message === "Catégorie non trouvée.") {
        res.status(404).json({ error: err.message });
      } else if (err.message === "Une catégorie avec ce nom existe déjà.") {
        res.status(400).json({ error: err.message });
      } else {
        res.status(500).json({ error: "Erreur serveur." });
      }
    }
  }

  public async deleteCategory(req: Request, res: Response): Promise<void> {
    try {
      const result = await CategoryService.deleteCategory(req.params.id);
      res.json(result);
    } catch (err: any) {
      if (err.message === "Catégorie non trouvée.") {
        res.status(404).json({ error: err.message });
      } else {
        res.status(500).json({ error: "Erreur serveur." });
      }
    }
  }
}

export const categoryController = new CategoryController();
