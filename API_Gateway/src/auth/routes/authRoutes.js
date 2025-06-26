const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { authenticate, checkRole, checkSelfAccess } = require("../middleware/authMiddleware");

router.post("/register", authController.register);
router.post("/login", authController.login);

router.use(authenticate);
router.get("/me", authController.getCurrentUser);
router.get("/users", checkRole(["SUPER_ADMIN"]), authController.getAllUsers);
router.put("/users/:id", checkSelfAccess, authController.updateUser);
router.delete("/users/:id", checkSelfAccess, authController.deleteUser);

module.exports = router;
