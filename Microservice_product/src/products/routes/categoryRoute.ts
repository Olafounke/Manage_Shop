import { Router } from "express";
import { categoryController } from "../controllers/categoryController";

const router = Router();

router.get("/", categoryController.getAllCategories);
router.get("/names", categoryController.getCategoryNames);
router.post("/", categoryController.createCategory);
router.put("/:id", categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

export default router;
