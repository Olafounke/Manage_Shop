const express = require("express");
const router = express.Router();
const TransfertController = require("../controllers/transfertController");
const authMiddleware = require("../../auth/middleware/authMiddleware");

router.post(
  "/",
  authMiddleware.authenticate,
  authMiddleware.checkRole(["ADMIN_STORE", "SUPER_ADMIN"]),
  TransfertController.createTransfert
);
router.get(
  "/store/:storeId",
  authMiddleware.authenticate,
  authMiddleware.checkRole(["ADMIN_STORE", "SUPER_ADMIN"]),
  TransfertController.getTransfertsByStore
);
router.put(
  "/:id/accept",
  authMiddleware.authenticate,
  authMiddleware.checkRole(["ADMIN_STORE", "SUPER_ADMIN"]),
  TransfertController.acceptTransfert
);
router.put(
  "/:id/reject",
  authMiddleware.authenticate,
  authMiddleware.checkRole(["ADMIN_STORE", "SUPER_ADMIN"]),
  TransfertController.rejectTransfert
);

module.exports = router;
