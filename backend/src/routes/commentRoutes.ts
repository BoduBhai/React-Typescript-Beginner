import { Router } from "express";
import * as commentController from "../controllers/commentController";
import { requireAuth } from "@clerk/express";

const router = Router();

// Create comment
router.post("/:productId", requireAuth(), commentController.createComment);

// Delete comment
router.delete("/:commentId", requireAuth(), commentController.deleteComment);

export default router;
