import { Transfert, ITransfert } from "../models/Transfert";
import mongoose from "mongoose";

export class TransfertService {
  static async createTransfert(
    productId: string,
    productName: string,
    quantity: number,
    fromStoreId: string,
    fromStoreName: string,
    toStoreId: string,
    toStoreName: string
  ): Promise<ITransfert> {
    try {
      if (!productId || !quantity || !fromStoreId || !toStoreId) {
        throw new Error("Données manquantes pour créer le transfert");
      }

      if (fromStoreId === toStoreId) {
        throw new Error("Le store source et destination ne peuvent pas être identiques");
      }

      if (quantity <= 0) {
        throw new Error("La quantité doit être positive");
      }

      const transfert = new Transfert({
        productId: new mongoose.Types.ObjectId(productId),
        productName,
        quantity,
        fromStoreId,
        fromStoreName,
        toStoreId,
        toStoreName,
        status: "PENDING",
        transfertDate: new Date(),
      });

      const savedTransfert = await transfert.save();
      return savedTransfert;
    } catch (error: any) {
      console.error("Erreur lors de la création du transfert:", error);
      throw error;
    }
  }

  static async getTransfertsByStore(
    storeId: string,
    type: "incoming" | "outgoing" = "incoming"
  ): Promise<ITransfert[]> {
    try {
      if (!storeId) {
        throw new Error("StoreId requis");
      }

      const query = type === "incoming" ? { toStoreId: storeId } : { fromStoreId: storeId };

      const transferts = await Transfert.find({ ...query, status: "PENDING" }).sort({ transfertDate: -1 });

      return transferts;
    } catch (error: any) {
      console.error("Erreur lors de la récupération des transferts:", error);
      throw error;
    }
  }

  static async getAllTransfertsByStore(storeId: string): Promise<ITransfert[]> {
    try {
      const transferts = await Transfert.find({
        $or: [{ toStoreId: storeId }, { fromStoreId: storeId }],
      }).sort({ transfertDate: -1 });

      return transferts;
    } catch (error: any) {
      console.error("Erreur lors de la récupération de tous les transferts:", error);
      throw error;
    }
  }

  static async acceptTransfert(transfert: ITransfert): Promise<ITransfert> {
    try {
      if (transfert.status !== "PENDING") {
        throw new Error("Ce transfert a déjà été traité");
      }

      transfert.status = "ACCEPTED";
      transfert.responseDate = new Date();

      const updatedTransfert = await transfert.save();
      return updatedTransfert;
    } catch (error: any) {
      console.error("Erreur lors de l'acceptation du transfert:", error);
      throw error;
    }
  }

  static async rejectTransfert(transfert: ITransfert): Promise<ITransfert> {
    try {
      if (transfert.status !== "PENDING") {
        throw new Error("Ce transfert a déjà été traité");
      }

      transfert.status = "REJECTED";
      transfert.responseDate = new Date();

      const updatedTransfert = await transfert.save();
      return updatedTransfert;
    } catch (error: any) {
      console.error("Erreur lors du refus du transfert:", error);
      throw error;
    }
  }

  static async getTransfertById(transfertId: string): Promise<ITransfert> {
    try {
      const transfert = await Transfert.findById(transfertId);

      if (!transfert) {
        throw new Error("Transfert non trouvé");
      }

      return transfert;
    } catch (error: any) {
      console.error("Erreur lors de la récupération du transfert:", error);
      throw error;
    }
  }
}
