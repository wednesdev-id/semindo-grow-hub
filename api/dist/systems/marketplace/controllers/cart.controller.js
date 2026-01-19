"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartController = void 0;
const cart_service_1 = require("../services/cart.service");
const zod_1 = require("zod");
const addToCartSchema = zod_1.z.object({
    productId: zod_1.z.string().uuid(),
    quantity: zod_1.z.number().min(1),
    variantId: zod_1.z.string().uuid().optional(),
});
const updateCartItemSchema = zod_1.z.object({
    quantity: zod_1.z.number().min(0),
});
exports.cartController = {
    getCart: async (req, res) => {
        try {
            const userId = req.user.id;
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
            const { productId, quantity, variantId } = addToCartSchema.parse(req.body);
            const item = await cart_service_1.cartService.addToCart(userId, productId, quantity, variantId);
            res.status(201).json({ data: item });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ error: error.errors });
            }
            res.status(400).json({ error: error.message });
        }
    },
    updateCartItem: async (req, res) => {
        try {
            const userId = req.user.id;
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
            const userId = req.user.id;
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
            const userId = req.user.id;
            await cart_service_1.cartService.clearCart(userId);
            res.status(204).send();
        }
        catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
};
