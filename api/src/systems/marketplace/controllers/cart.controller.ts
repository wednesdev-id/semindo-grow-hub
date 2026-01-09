import { Request, Response } from 'express';
import { cartService } from '../services/cart.service';
import { z } from 'zod';

const addToCartSchema = z.object({
    productId: z.string().uuid(),
    quantity: z.number().min(1),
});

const updateCartItemSchema = z.object({
    quantity: z.number().min(0),
});

export const cartController = {
    getCart: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id; // Corrected from .userId if needed, verify in middleware
            const cart = await cartService.getCart(userId);
            res.json({ data: cart });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    },

    addToCart: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.id;
            const { productId, quantity } = addToCartSchema.parse(req.body);

            const item = await cartService.addToCart(userId, productId, quantity);
            res.status(201).json({ data: item });
        } catch (error: any) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ error: error.errors });
            }
            res.status(400).json({ error: error.message });
        }
    },

    updateCartItem: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.userId;
            const { id } = req.params;
            const { quantity } = updateCartItemSchema.parse(req.body);

            const item = await cartService.updateCartItem(userId, id, quantity);
            res.json({ data: item });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    },

    removeCartItem: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.userId;
            const { id } = req.params;

            await cartService.removeCartItem(userId, id);
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    },

    clearCart: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.userId;
            await cartService.clearCart(userId);
            res.status(204).send();
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
};
