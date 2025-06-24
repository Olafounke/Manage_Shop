import { Router } from "express";
import { cartController } from "../controllers/cartController";

const router = Router();

router.get("/", cartController.getUserCart);
router.post("/", cartController.addToCart);
router.put("/:productId", cartController.updateCartItem);
router.delete("/:productId", cartController.removeFromCart);
router.delete("/", cartController.clearCart);

export default router;
