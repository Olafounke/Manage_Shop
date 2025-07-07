import { Router } from "express";
import { transfertController } from "../controllers/transfertController";

const router = Router();

router.post("/", transfertController.createTransfert);
router.get("/store/:storeId", transfertController.getTransfertsByStore);
router.put("/:id/accept", transfertController.acceptTransfert);
router.put("/:id/reject", transfertController.rejectTransfert);

export default router;
