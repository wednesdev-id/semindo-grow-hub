import { Request, Response } from 'express';
import { storeService } from '../services/store.service';
import { z } from 'zod';

const createStoreSchema = z.object({
    name: z.string().min(3),
    slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
    description: z.string().optional(),
});

const updateStoreSchema = z.object({
    name: z.string().min(3).optional(),
    description: z.string().optional(),
    logoUrl: z.string().url().optional(),
    bannerUrl: z.string().url().optional(),
    refundPolicy: z.string().optional(),
    shippingPolicy: z.string().optional(),
});

export const storeController = {
    createStore: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.userId;
            const data = createStoreSchema.parse(req.body);

            const existingStore = await storeService.getStoreByUserId(userId);
            if (existingStore) {
                return res.status(400).json({ error: 'User already has a store' });
            }

            const store = await storeService.createStore(userId, data);
            res.status(201).json({ data: store });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ error: error.errors });
            }
            res.status(500).json({ error: 'Failed to create store' });
        }
    },

    getMyStore: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.userId;
            const store = await storeService.getStoreByUserId(userId);
            if (!store) {
                return res.status(404).json({ error: 'Store not found' });
            }
            res.json({ data: store });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch store' });
        }
    },

    getStoreBySlug: async (req: Request, res: Response) => {
        try {
            const { slug } = req.params;
            const store = await storeService.getStoreBySlug(slug);
            if (!store) {
                return res.status(404).json({ error: 'Store not found' });
            }
            res.json({ data: store });
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch store' });
        }
    },

    updateMyStore: async (req: Request, res: Response) => {
        try {
            const userId = (req as any).user.userId;
            const data = updateStoreSchema.parse(req.body);

            const store = await storeService.updateStore(userId, data);
            res.json({ data: store });
        } catch (error) {
            if (error instanceof z.ZodError) {
                return res.status(400).json({ error: error.errors });
            }
            res.status(500).json({ error: 'Failed to update store' });
        }
    },
};
