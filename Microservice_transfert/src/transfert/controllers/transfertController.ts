import { Request, Response } from "express";
import { TransfertService } from "../services/transfertService";

interface AuthRequest extends Request {
  user?: { userId: string; role: string; store: string };
}

export class TransfertController {
  public async createTransfert(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { productId, productName, quantity, fromStoreId, fromStoreName, toStoreId, toStoreName } = req.body;
      const userStoreId = req.user?.store;
      const userRole = req.user?.role;

      if (userRole !== "SUPER_ADMIN" && userStoreId !== fromStoreId) {
        res.status(403).json({ error: "Vous ne pouvez créer des transferts que depuis votre store" });
        return;
      }

      const transfert = await TransfertService.createTransfert(
        productId,
        productName,
        quantity,
        fromStoreId,
        fromStoreName,
        toStoreId,
        toStoreName
      );

      res.status(201).json(transfert);
    } catch (error: any) {
      console.error("Erreur createTransfert:", error);
      res.status(400).json({ error: error.message });
    }
  }

  public async getTransfertsByStore(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { storeId } = req.params;
      const { type } = req.query;

      const userStoreId = req.user?.store;
      const userRole = req.user?.role;

      if (userRole !== "SUPER_ADMIN" && userStoreId !== storeId) {
        res.status(403).json({ error: "Accès refusé : vous ne pouvez voir que les transferts de votre store" });
        return;
      }

      let result;

      if (type === "all") {
        result = await TransfertService.getAllTransfertsByStore(storeId);
      } else {
        const transfertType = (type as string) === "outgoing" ? "outgoing" : "incoming";
        result = await TransfertService.getTransfertsByStore(storeId, transfertType);
      }

      res.json(result);
    } catch (error: any) {
      console.error("Erreur getTransfertsByStore:", error);
      res.status(500).json({ error: error.message });
    }
  }

  public async acceptTransfert(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const transfert = await TransfertService.getTransfertById(id);

      if (!transfert) {
        res.status(404).json({ error: "Transfert non trouvé" });
        return;
      }

      const userRole = req.user?.role;
      const userStoreId = req.user?.store;

      if (userRole !== "SUPER_ADMIN" && userStoreId !== transfert.toStoreId) {
        res.status(403).json({ error: "Seul l'admin du store de destination peut accepter ce transfert" });
        return;
      }

      const updatedTransfert = await TransfertService.acceptTransfert(transfert);

      res.json({ success: true, transfert: updatedTransfert });
    } catch (error: any) {
      console.error("Erreur acceptTransfert:", error);
      if (error.message === "Transfert non trouvé") {
        res.status(404).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  }

  public async rejectTransfert(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const transfert = await TransfertService.getTransfertById(id);

      if (!transfert) {
        res.status(404).json({ error: "Transfert non trouvé" });
        return;
      }

      const userRole = req.user?.role;
      const userStoreId = req.user?.store;

      if (userRole !== "SUPER_ADMIN" && userStoreId !== transfert.toStoreId) {
        res.status(403).json({ error: "Seul l'admin du store de destination peut accepter ce transfert" });
        return;
      }

      const updatedTransfert = await TransfertService.rejectTransfert(transfert);

      res.json(updatedTransfert);
    } catch (error: any) {
      console.error("Erreur rejectTransfert:", error);
      if (error.message === "Transfert non trouvé") {
        res.status(404).json({ error: error.message });
      } else {
        res.status(400).json({ error: error.message });
      }
    }
  }
}

export const transfertController = new TransfertController();
