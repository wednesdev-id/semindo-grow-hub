import { db as prisma } from '../../utils/db';
import { Cart, CartItem } from '@prisma/client';

export const cartService = {
    getCart: async (userId: string) => {
        let cart = await prisma.cart.findUnique({
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
            cart = await prisma.cart.create({
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

    addToCart: async (userId: string, productId: string, quantity: number, variantId?: string) => {
        const cart = await cartService.getCart(userId);

        const existingItem = await prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                productId,
                variantId: variantId || null,
            }
        });

        if (existingItem) {
            return prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + quantity }
            });
        }

        return prisma.cartItem.create({
            data: {
                cartId: cart.id,
                productId,
                quantity,
                variantId,
            }
        });
    },

    updateCartItem: async (userId: string, itemId: string, quantity: number) => {
        const cart = await cartService.getCart(userId);

        // Verify item belongs to user's cart
        const item = await prisma.cartItem.findFirst({
            where: { id: itemId, cartId: cart.id }
        });

        if (!item) throw new Error('Item not found');

        if (quantity <= 0) {
            return prisma.cartItem.delete({ where: { id: itemId } });
        }

        return prisma.cartItem.update({
            where: { id: itemId },
            data: { quantity }
        });
    },

    removeCartItem: async (userId: string, itemId: string) => {
        const cart = await cartService.getCart(userId);

        const item = await prisma.cartItem.findFirst({
            where: { id: itemId, cartId: cart.id }
        });

        if (!item) throw new Error('Item not found');

        return prisma.cartItem.delete({ where: { id: itemId } });
    },

    clearCart: async (userId: string) => {
        const cart = await cartService.getCart(userId);
        return prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
    }
};
