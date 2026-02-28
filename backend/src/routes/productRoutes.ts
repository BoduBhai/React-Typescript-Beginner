import { Router } from "express";

import * as productController from "../controllers/productController";
import { requireAuth } from "@clerk/express";

const router = Router();

// All products
router.get("/", productController.getAllProducts);

// Get user's products
router.get("/my", requireAuth(), productController.getMyProducts);

// Get product by id
router.get("/:id", productController.getProductById);

// Create product
router.post("/", requireAuth(), productController.createProduct);

// Update product
router.put("/:id", requireAuth(), productController.updateProduct);

// Delete product
router.delete("/:id", requireAuth(), productController.deleteProduct);

export default router;
