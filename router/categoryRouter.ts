import express from "express";
const router = express.Router();
import {getCategories, getCategoryById, createCategory, updateCategory, deleteCategory} from "../controller/categoryController"

router.get("/category", getCategories);
router.get("/category/:id", getCategoryById);
router.post("/create-category", createCategory);
router.put("/update-category/:id", updateCategory);
router.delete("/delete-category/:id", deleteCategory);

export default router;    