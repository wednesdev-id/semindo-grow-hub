import { db as prisma } from '../../utils/db';
import { Store } from '../../../../prisma/generated/client';

export const storeService = {
    createStore: async (userId: string, data: { name: string; slug: string; description?: string }) => {
        return prisma.store.create({
            data: {
                userId,
                ...data,
            },
        });
    },

    getStoreByUserId: async (userId: string) => {
        return prisma.store.findUnique({
            where: { userId },
            include: {
                products: true,
            },
        });
    },

    getStoreBySlug: async (slug: string) => {
        return prisma.store.findUnique({
            where: { slug },
            include: {
                products: true,
                user: {
                    select: {
                        fullName: true,
                        email: true,
                    }
                }
            },
        });
    },

    updateStore: async (userId: string, data: Partial<Store>) => {
        return prisma.store.update({
            where: { userId },
            data,
        });
    },
};
