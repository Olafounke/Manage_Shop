import { Response, Request } from "express";
import { OrderService } from "../services/orderService";

interface AuthRequest extends Request {
  user?: { userId: string; role: string; store: string };
}

export class OrderController {
  public async getUserOrders(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const orders = await OrderService.getUserOrders(userId);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
  }

  public async getStoreOrders(req: AuthRequest, res: Response): Promise<void> {
    try {
      const storeId = req.user!.store;

      const orders = await OrderService.getStoreOrders(storeId);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
  }

  public async updateOrderStatus(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        res.status(400).json({ message: "Statut requis" });
      }

      const order = await OrderService.updateOrderStatus(id, status);
      res.json(order);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  public async createCheckoutSession(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.userId;
      const { cart } = req.body;

      if (!cart) {
        res.status(400).json({ message: "Cart enrichi requis" });
        return;
      }

      const session = await OrderService.createCheckoutSession(userId, cart);
      console.log("session", session);
      res.json(session);
    } catch (error: any) {
      console.error(error);
      if (error.message === "Panier vide") {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ error: "Erreur création session Stripe" });
      }
    }
  }

  public async verifyPayment(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        res.status(400).json({ message: "Session ID requis" });
        return;
      }

      const result = await OrderService.verifyPayment(sessionId);
      res.json(result);
    } catch (error: any) {
      console.error("Erreur lors de la vérification du paiement:", error);
      res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
  }

  public async cancelOrdersByStore(req: Request, res: Response): Promise<void> {
    try {
      const { storeId } = req.params;

      if (!storeId) {
        res.status(400).json({ message: "StoreId requis dans les paramètres" });
        return;
      }

      const result = await OrderService.cancelOrdersByStore(storeId);
      res.json({
        message: `${result.cancelledOrdersCount} commandes annulées pour le store ${storeId}`,
        cancelledOrdersCount: result.cancelledOrdersCount,
        cancelledOrderGroupsCount: result.cancelledOrderGroupsCount,
      });
    } catch (error: any) {
      console.error("Erreur lors de l'annulation des commandes:", error);
      res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
  }
}
export const orderController = new OrderController();
