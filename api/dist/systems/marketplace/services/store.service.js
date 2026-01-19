"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storeService = void 0;
const db_1 = require("../../utils/db");
exports.storeService = {
    createStore: async (userId, data) => {
        return db_1.db.store.create({
            data: {
                userId,
                ...data,
            },
        });
    },
    getStoreByUserId: async (userId) => {
        return db_1.db.store.findUnique({
            where: { userId },
            include: {
                products: true,
            },
        });
    },
    getStoreBySlug: async (slug) => {
        return db_1.db.store.findUnique({
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
    updateStore: async (userId, data) => {
        return db_1.db.store.update({
            where: { userId },
            data,
        });
    },
};
