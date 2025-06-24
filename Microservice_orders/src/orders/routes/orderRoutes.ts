import { Router } from "express";
import { orderController } from "../controllers/orderController";

const router = Router();

router.get("/", orderController.getUserOrders);
router.get("/:id", orderController.getOrderById);
router.get("/admin", orderController.getOrdersForStoreAdmin);
router.put("/:id/status", orderController.updateOrderStatus);

router.post("/checkout", orderController.createCheckoutSession);
router.get("/verify-payment/:sessionId", orderController.verifyPayment);

export default router;
