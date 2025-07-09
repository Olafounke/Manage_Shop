import { Router } from "express";
import { orderController } from "../controllers/orderController";

const router = Router();

router.get("/", orderController.getUserOrders);
router.get("/:id/order", orderController.getOrderById);
router.get("/:id/groupOrder", orderController.getOrderGroupById);
router.get("/admin", orderController.getStoreOrders);
router.put("/:id/status", orderController.updateOrderStatus);

router.post("/checkout", orderController.createCheckoutSession);
router.get("/verify-payment/:sessionId", orderController.verifyPayment);
router.put("/stores/:storeId/cancel", orderController.cancelOrdersByStore);

export default router;
