import { Request, Response } from "express";

import * as queries from "../db/queries";
import { getAuth } from "@clerk/express";

export const createComment = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorised" });

        const productId = req.params.productId as string;
        const { content } = req.body;

        const normalized = (
            typeof content === "string" ? content : String(content)
        ).trim();
        if (normalized.length === 0) {
            res.status(400).json({ error: "Invalid comment content" });
            return;
        }

        const existingProduct = await queries.getProductById(productId);
        if (!existingProduct)
            return res.status(404).json({ error: "Product not found" });

        const comment = await queries.createComment({
            content: normalized,
            productId,
            userId,
        });

        res.status(201).json(comment);
    } catch (error) {
        console.log("Error creating comment", error);
        res.status(500).json({ error: "Failed to create comment" });
    }
};

export const deleteComment = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorised" });

        const commentId = req.params.commentId as string;

        const existingComment = await queries.getCommentById(commentId);
        if (!existingComment)
            return res.status(404).json({
                error: "Comment not found",
            });

        if (existingComment?.userId !== userId) {
            return res.status(403).json({
                error: "You can only delete your own comment",
            });
        }

        await queries.deleteComment(commentId);

        res.status(200).json({ message: "Comment deleted successfully" });
    } catch (error) {
        console.log("Error deleting comment", error);
        res.status(500).json({ error: "Failed to delete comment" });
    }
};
