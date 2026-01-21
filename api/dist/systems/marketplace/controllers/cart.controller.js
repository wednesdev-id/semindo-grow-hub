"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartController = void 0;
const cart_service_1 = require("../services/cart.service");
const zod_1 = require("zod");
const addToCartSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid(),
    quantity: zod_1.z.number().min(1),
});
const updateCartItemSchema = zod_1.z.object({
    quantity: zod_1.z.number().min(0),
});
exports.cartController = {
    getCart: async (req, res) => {
        try {
            const userId = req.user.id; // Corrected from .userId if needed, verify in middleware
            const cart = await cart_service_1.cartService.getCart(userId);
            res.json({ data: cart });
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
    addToCart: async (req, res) => {
        try {
            const userId = req.user.id;
            const { productId, quantity } = addToCartSchema.parse(req.body);
            const item = await cart_service_1.cartService.addToCart(userId, productId, quantity);
            res.status(201).json({ data: item });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ error: error.issues });
            }
            res.status(400).json({ error: error.message });
        }
    },
    updateCartItem: async (req, res) => {
        try {
            const userId = req.user.userId;
            const { id } = req.params;
            const { quantity } = updateCartItemSchema.parse(req.body);
            const item = await cart_service_1.cartService.updateCartItem(userId, id, quantity);
            res.json({ data: item });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    removeCartItem: async (req, res) => {
        try {
            const userId = req.user.userId;
            const { id } = req.params;
            await cart_service_1.cartService.removeCartItem(userId, id);
            res.status(204).send();
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    },
    clearCart: async (req, res) => {
        try {
            const userId = req.user.userId;
            await cart_service_1.cartService.clearCart(userId);
            res.status(204).send();
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};
