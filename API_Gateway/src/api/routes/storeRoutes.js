const express = require("express");
const router = express.Router();
const StoreController = require("../controllers/storeController");
const InventoryController = require("../controllers/inventoryController");
const authMiddleware = require("../../auth/middleware/authMiddleware");

router.get(
  "/",
  authMiddleware.authenticate,
  authMiddleware.checkRole(["ADMIN_STORE", "SUPER_ADMIN"]),
  StoreController.getAllStores
);

router.get(
  "/:storeId/info",
  authMiddleware.authenticate,
  authMiddleware.checkRole(["ADMIN_STORE", "SUPER_ADMIN"]),
  StoreController.getStoreById
);

router.post(
  "/create",
  authMiddleware.authenticate,
  authMiddleware.checkRole(["SUPER_ADMIN"]),
  StoreController.createStore
);

router.put(
  "/:storeId",
  authMiddleware.authenticate,
  authMiddleware.checkRole(["ADMIN_STORE", "SUPER_ADMIN"]),
  StoreController.updateStoreById
);

router.delete(
  "/:storeId",
  authMiddleware.authenticate,
  authMiddleware.checkRole(["SUPER_ADMIN"]),
  StoreController.deleteStoreById
);

router.get(
  "/:storeId/inventory",
  authMiddleware.authenticate,
  authMiddleware.checkRole(["ADMIN_STORE", "SUPER_ADMIN"]),
  InventoryController.getInventoryByStoreId
);

router.get(
  "/:storeId/inventory/:id",
  authMiddleware.authenticate,
  authMiddleware.checkRole(["ADMIN_STORE", "SUPER_ADMIN"]),
  InventoryController.getInventoryItem
);

router.post(
  "/:storeId/inventory",
  authMiddleware.authenticate,
  authMiddleware.checkRole(["ADMIN_STORE", "SUPER_ADMIN"]),
  InventoryController.createInventoryItem
);

router.put(
  "/:storeId/inventory/:id",
  authMiddleware.authenticate,
  authMiddleware.checkRole(["ADMIN_STORE", "SUPER_ADMIN"]),
  InventoryController.updateInventoryItem
);

router.delete(
  "/:storeId/inventory/:id",
  authMiddleware.authenticate,
  authMiddleware.checkRole(["ADMIN_STORE", "SUPER_ADMIN"]),
  InventoryController.deleteInventoryItem
);

router.post(
  "/:storeId/inventory/:id/increment",
  authMiddleware.authenticate,
  authMiddleware.checkRole(["ADMIN_STORE", "SUPER_ADMIN"]),
  InventoryController.incrementInventoryItem
);

router.post(
  "/:storeId/inventory/:id/decrement",
  authMiddleware.authenticate,
  authMiddleware.checkRole(["ADMIN_STORE", "SUPER_ADMIN"]),
  InventoryController.decrementInventoryItem
);

module.exports = router;
