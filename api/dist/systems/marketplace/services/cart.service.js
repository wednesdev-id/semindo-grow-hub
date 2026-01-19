"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cartService = void 0;
const db_1 = require("../../utils/db");
exports.cartService = {
    getCart: async (userId) => {
        let cart = await db_1.db.cart.findUnique({
            where: { userId },
            include: {
                items: {
                    include: {
                        product: {
                            include: {
                                store: {
                                    select: {
                                        id: true,
                                        name: true,
                                        slug: true,
                                    }
                                }
                            }
                        },
                        variant: true,
                    },
                    orderBy: {
                        product: {
                            storeId: 'asc'
                        }
                    }
                }
            }
        });
        if (!cart) {
            cart = await db_1.db.cart.create({
                data: { userId },
                include: {
                    items: {
                        include: {
                            product: {
                                include: {
                                    store: true
                                }
                            },
                            variant: true
                        }
                    }
                }
            });
        }
        return cart;
    },
    addToCart: async (userId, productId, quantity, variantId) => {
        const cart = await exports.cartService.getCart(userId);
        const existingItem = await db_1.db.cartItem.findFirst({
            where: {
                cartId: cart.id,
                productId,
                variantId: variantId || null,
            }
        });
        if (existingItem) {
            return db_1.db.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity }
            });
        }
        return db_1.db.cartItem.create({
            data: {
                cartId: cart.id,
                productId,
                quantity,
                variantId,
            }
        });
    },
    updateCartItem: async (userId, itemId, quantity) => {
        const cart = await exports.cartService.getCart(userId);
        // Verify item belongs to user's cart
        const item = await db_1.db.cartItem.findFirst({
            where: { id: itemId, cartId: cart.id }
        });
        if (!item)
            throw new Error('Item not found');
        if (quantity <= 0) {
            return db_1.db.cartItem.delete({ where: { id: itemId } });
        }
        return db_1.db.cartItem.update({
            where: { id: itemId },
            data: { quantity }
        });
    },
    removeCartItem: async (userId, itemId) => {
        const cart = await exports.cartService.getCart(userId);
        const item = await db_1.db.cartItem.findFirst({
            where: { id: itemId, cartId: cart.id }
        });
        if (!item)
            throw new Error('Item not found');
        return db_1.db.cartItem.delete({ where: { id: itemId } });
    },
    clearCart: async (userId) => {
        const cart = await exports.cartService.getCart(userId);
        return db_1.db.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
};
