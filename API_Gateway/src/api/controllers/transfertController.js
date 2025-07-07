const TransfertService = require("../service/transfertService");

class TransfertController {
  static async createTransfert(req, res) {
    try {
      const result = await TransfertService.createTransfert(req.body, req.user);
      res.status(201).json(result);
    } catch (error) {
      console.error("Erreur createTransfert:", error);
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  static async getTransfertsByStore(req, res) {
    try {
      const { storeId } = req.params;
      const { type } = req.query;

      const result = await TransfertService.getTransfertsByStore(storeId, type, req.user);
      res.json(result);
    } catch (error) {
      console.error("Erreur getTransfertsByStore:", error);
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  static async acceptTransfert(req, res) {
    try {
      const { id } = req.params;

      const result = await TransfertService.acceptTransfert(id, req.user);
      res.json(result);
    } catch (error) {
      console.error("Erreur acceptTransfert:", error);
      res.status(error.status || 500).json({ error: error.message });
    }
  }

  static async rejectTransfert(req, res) {
    try {
      const { id } = req.params;

      const result = await TransfertService.rejectTransfert(id, req.user);
      res.json(result);
    } catch (error) {
      console.error("Erreur rejectTransfert:", error);
      res.status(error.status || 500).json({ error: error.message });
    }
  }
}

module.exports = TransfertController;
