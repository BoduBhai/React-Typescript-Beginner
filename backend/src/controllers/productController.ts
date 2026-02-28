import type { Request, Response } from "express";

import * as queries from "../db/queries";
import { getAuth } from "@clerk/express";

export const getAllProducts = async (req: Request, res: Response) => {
    try {
        const products = await queries.getAllProducts();
        return res.status(200).json(products);
    } catch (error) {
        console.log("Errog getting products", error);
        res.status(500).json({ error: "Failled to get products" });
    }
};

export const getProductById = async (req: Request, res: Response) => {
    try {
        // ** as string is different
        const id = req.params.id as string;
        const product = await queries.getProductById(id);

        if (!product)
            return res.status(404).json({ error: "Products not found" });

        res.status(200).json(product);
    } catch (error) {
        console.log("Errong getting product", error);
        res.status(500).json({ error: "Failled to get product" });
    }
};

export const getMyProducts = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorised" });

        const products = await queries.getProductsByUserId(userId);
        res.status(200).json(products);
    } catch (error) {
        console.log("Errong getting user products", error);
        res.status(500).json({ error: "Failled to get product" });
    }
};

export const createProduct = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorised" });

        const { title, description, imageUrl } = req.body;

        if (!title || !description || !imageUrl) {
            res.status(400).json({ error: "Missing required fields" });
            return;
        }

        const product = await queries.createProduct({
            title,
            description,
            imageUrl,
            userId,
        });

        res.status(201).json(product);
    } catch (error) {
        console.log("Errong creating product", error);
        res.status(500).json({ error: "Failled to create product" });
    }
};

export const updateProduct = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorised" });

        const id = req.params.id as string;
        const { title, description, imageUrl } = req.body;

        const existingProduct = await queries.getProductById(id);
        if (!existingProduct) {
            res.status(404).json({ error: "Product not found" });
            return;
        }

        if (existingProduct?.userId !== userId) {
            res.status(403).json({
                error: "You can only update your own product",
            });
            return;
        }

        const product = await queries.updateProduct(id, {
            title,
            description,
            imageUrl,
        });

        res.status(200).json(product);
    } catch (error) {
        console.log("Errong updating product", error);
        res.status(500).json({ error: "Failled to update product" });
    }
};

export const deleteProduct = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        if (!userId) return res.status(401).json({ error: "Unauthorised" });

        const id = req.params.id as string;
        const existingProduct = await queries.getProductById(id);
        if (!existingProduct) {
            res.status(404).json({ error: "Products not found" });
            return;
        }

        if (existingProduct?.userId !== userId) {
            res.status(403).json({
                error: "You can only delete your own product",
            });
            return;
        }

        await queries.deleteProduct(id);
        res.sendStatus(204);
    } catch (error) {
        console.log("Errong deleting product", error);
        res.status(500).json({ error: "Failled to delete product" });
    }
};
