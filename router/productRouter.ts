const express = require("express");
import { getProducts, createProduct, getProductById } from "../controller/productController";
const router = express.Router();

router.get("/products", getProducts);
router.get("/product/:id", getProductById);
router.post("/create-product", createProduct);

export default router;