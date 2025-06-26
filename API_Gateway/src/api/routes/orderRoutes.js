const express = require("express");
const router = express.Router();
const OrderController = require("../controllers/orderController");
const authMiddleware = require("../../auth/middleware/authMiddleware");

router.get("/", authMiddleware.authenticate, OrderController.getUserOrders);
router.get("/:id", authMiddleware.authenticate, OrderController.getOrderById);
router.get(
  "/admin",
  authMiddleware.authenticate,
  authMiddleware.checkRole(["ADMIN_STORE", "SUPER_ADMIN"]),
  OrderController.getOrdersForStoreAdmin
);
router.put(
  "/:id/status",
  authMiddleware.authenticate,
  authMiddleware.checkRole(["ADMIN_STORE", "SUPER_ADMIN"]),
  OrderController.updateOrderStatus
);

router.post("/checkout", authMiddleware.authenticate, OrderController.createCheckoutSession);
router.get("/verify-payment/:sessionId", authMiddleware.authenticate, OrderController.verifyPayment);

module.exports = router;
