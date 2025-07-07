const ProxyService = require("./proxyService");
const InventoryService = require("./inventoryService");
const { transferts } = require("../../config/microservices");

class TransfertService {
  static async createTransfert(transfertData, user) {
    try {
      const availableStock = await InventoryService.getInventoryItemById(
        transfertData.fromStoreId,
        transfertData.productId
      );

      if (availableStock < transfertData.quantity) {
        throw new Error(`Stock insuffisant. Disponible: ${availableStock}, Demandé: ${transfertData.quantity}`);
      }

      const result = await ProxyService.forwardRequest(
        "transferts",
        transferts.endpoints.create,
        "POST",
        transfertData,
        {},
        user
      );
      return result;
    } catch (error) {
      console.error("Erreur lors de la création du transfert:", error);
      throw error;
    }
  }

  static async getTransfertsByStore(storeId, type, user) {
    try {
      const endpoint = ProxyService.buildEndpoint(transferts.endpoints.getByStore, { storeId });
      const queryParams = type ? { type } : {};

      const result = await ProxyService.forwardRequest("transferts", endpoint, "GET", null, {}, user, queryParams);
      return result;
    } catch (error) {
      console.error("Erreur lors de la récupération des transferts:", error);
      throw error;
    }
  }

  static async acceptTransfert(transfertId, user) {
    try {
      const availableStock = await InventoryService.getInventoryItemById(
        transfertData.fromStoreId,
        transfertData.productId
      );

      if (availableStock < transfertData.quantity) {
        throw new Error(`Stock insuffisant. Disponible: ${availableStock}, Demandé: ${transfertData.quantity}`);
      }

      const endpoint = ProxyService.buildEndpoint(transferts.endpoints.accept, { id: transfertId });
      const result = await ProxyService.forwardRequest("transferts", endpoint, "PUT", null, {}, user);

      if (result.success) {
        try {
          await InventoryService.incrementInventoryItem(
            transfertData.toStoreId,
            transfertData.productId,
            transfertData.quantity
          );
          await InventoryService.decrementInventoryItem(
            transfertData.fromStoreId,
            transfertData.productId,
            transfertData.quantity
          );
        } catch (inventoryError) {
          console.error("Erreur lors de la mise à jour des stocks:", inventoryError);
        }
      }

      return result;
    } catch (error) {
      console.error("Erreur lors de l'acceptation du transfert:", error);
      throw error;
    }
  }

  static async rejectTransfert(transfertId, user) {
    try {
      const endpoint = ProxyService.buildEndpoint(transferts.endpoints.reject, { id: transfertId });
      const result = await ProxyService.forwardRequest("transferts", endpoint, "PUT", { responseMessage }, {}, user);
      return result;
    } catch (error) {
      console.error("Erreur lors du refus du transfert:", error);
      throw error;
    }
  }

  static async rejectAllStoreTransferts(storeId) {
    try {
      const systemUser = {
        userId: "system",
        role: "SUPER_ADMIN",
        store: null,
      };

      const transferts = await this.getTransfertsByStore(storeId, "all", systemUser);

      if (!transferts || transferts.length === 0) {
        console.log(`Aucun transfert trouvé pour le store ${storeId}`);
        return { rejectedCount: 0, transferts: [] };
      }

      const pendingTransferts = transferts.filter((t) => t.status === "PENDING");

      if (pendingTransferts.length === 0) {
        console.log(`Aucun transfert en attente pour le store ${storeId}`);
        return { rejectedCount: 0, transferts: [] };
      }

      const rejectPromises = pendingTransferts.map((transfert) => this.rejectTransfert(transfert._id, systemUser));

      const rejectedTransferts = await Promise.allSettled(rejectPromises);

      const successfulRejections = rejectedTransferts.filter((result) => result.status === "fulfilled");
      const failedRejections = rejectedTransferts.filter((result) => result.status === "rejected");

      if (failedRejections.length > 0) {
        console.warn(`${failedRejections.length} transferts n'ont pas pu être rejetés pour le store ${storeId}`);
        failedRejections.forEach((failure, index) => {
          console.error(`Erreur transfert ${index}:`, failure.reason);
        });
      }

      return {
        rejectedCount: successfulRejections.length,
        failedCount: failedRejections.length,
        transferts: successfulRejections.map((result) => result.value),
      };
    } catch (error) {
      console.error(`Erreur lors du rejet des transferts pour le store ${storeId}:`, error);
      return { rejectedCount: 0, failedCount: 0, error: error.message };
    }
  }
}

module.exports = TransfertService;
