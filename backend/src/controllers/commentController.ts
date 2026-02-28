import { Request, Response } from "express";

import * as queries from "../db/queries";
import { getAuth } from "@clerk/express";

export const createComment = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorised" });

        const productId = req.params.id as string;
        const { content } = req.body;

        if (!content) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }

        const existingProduct = await queries.getProductById(productId);
        if (!existingProduct)
            return res.status(404).json({ error: "Product not found" });

        const comment = await queries.createComment({
            content,
            productId,
            userId,
        });

        res.status(201).json(comment);
    } catch (error) {
        console.log("Errong creating comment", error);
        res.status(500).json({ error: "Failled to create comment" });
    }
};

export const deleteComment = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorised" });

        const commentId = req.params.id as string;

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
        console.log("Errong deleting comment", error);
        res.status(500).json({ error: "Failled to delete comment" });
    }
};
