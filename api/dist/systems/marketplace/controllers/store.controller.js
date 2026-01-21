"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeController = void 0;
const store_service_1 = require("../services/store.service");
const zod_1 = require("zod");
const createStoreSchema = zod_1.z.object({
    name: zod_1.z.string().min(3),
    slug: zod_1.z.string().min(3).regex(/^[a-z0-9-]+$/),
    description: zod_1.z.string().optional(),
});
const updateStoreSchema = zod_1.z.object({
    name: zod_1.z.string().min(3).optional(),
    description: zod_1.z.string().optional(),
    logoUrl: zod_1.z.string().url().optional(),
    bannerUrl: zod_1.z.string().url().optional(),
    refundPolicy: zod_1.z.string().optional(),
    shippingPolicy: zod_1.z.string().optional(),
});
exports.storeController = {
    createStore: async (req, res) => {
        try {
            const userId = req.user.userId;
            const data = createStoreSchema.parse(req.body);
            const existingStore = await store_service_1.storeService.getStoreByUserId(userId);
            if (existingStore) {
                return res.status(400).json({ error: 'User already has a store' });
            }
            const store = await store_service_1.storeService.createStore(userId, data);
            res.status(201).json({ data: store });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ error: error.issues });
            }
            res.status(500).json({ error: 'Failed to create store' });
        }
    },
    getMyStore: async (req, res) => {
        try {
            const userId = req.user.userId;
            const store = await store_service_1.storeService.getStoreByUserId(userId);
            if (!store) {
                return res.status(404).json({ error: 'Store not found' });
            }
            res.json({ data: store });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch store' });
        }
    },
    getStoreBySlug: async (req, res) => {
        try {
            const { slug } = req.params;
            const store = await store_service_1.storeService.getStoreBySlug(slug);
            if (!store) {
                return res.status(404).json({ error: 'Store not found' });
            }
            res.json({ data: store });
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch store' });
        }
    },
    updateMyStore: async (req, res) => {
        try {
            const userId = req.user.userId;
            const data = updateStoreSchema.parse(req.body);
            const store = await store_service_1.storeService.updateStore(userId, data);
            res.json({ data: store });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({ error: error.issues });
            }
            res.status(500).json({ error: 'Failed to update store' });
        }
    },
};
