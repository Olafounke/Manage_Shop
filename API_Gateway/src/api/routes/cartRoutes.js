const express = require("express");
const router = express.Router();
const CartController = require("../controllers/cartController");
const authMiddleware = require("../../auth/middleware/authMiddleware");

router.get("/", authMiddleware.authenticate, CartController.getUserCart);
router.post("/", authMiddleware.authenticate, CartController.addToCart);
router.put("/:productId", authMiddleware.authenticate, CartController.updateCartItem);
router.delete("/:productId", authMiddleware.authenticate, CartController.removeFromCart);
router.delete("/", authMiddleware.authenticate, CartController.clearCart);

module.exports = router;
