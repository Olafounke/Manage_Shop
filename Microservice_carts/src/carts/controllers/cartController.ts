import { Request, Response } from "express";
import { CartService } from "../services/cartService";

interface AuthRequest extends Request {
  user?: { userId: string; role: string };
}

export class CartController {
  public async getUserCart(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const cart = await CartService.getUserCart(userId);

      if (!cart) {
        res.status(404).json({ message: "Panier non trouvé" });
      }
      res.json(cart);
    } catch (error: any) {
      res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
  }

  public async addToCart(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { productId, quantity, price } = req.body;

      if (!productId || !quantity || quantity <= 0) {
        res.status(400).json({ message: "productId, price et quantity supérieur à 0 requis" });
        return;
      }

      const cart = await CartService.addToCart(userId, productId, quantity, price);
      res.status(201).json(cart);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public async updateCartItem(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { productId } = req.params;
      const { quantity } = req.body;

      if (quantity === undefined || quantity < 0) {
        res.status(400).json({ message: "Quantité superieur à 0 requise" });
      }

      const cart = await CartService.updateCartItem(userId, productId, quantity);
      res.json(cart);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public async removeFromCart(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { productId } = req.params;

      const cart = await CartService.removeFromCart(userId, productId);
      res.json(cart);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public async clearCart(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const cart = await CartService.clearCart(userId);
      res.json(cart);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}

export const cartController = new CartController();
