"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("@prisma/client");
const uuidv7_1 = require("uuidv7");
const prismaClientSingleton = () => {
    return new client_1.PrismaClient().$extends({
        query: {
            $allModels: {
                async create({ args, query }) {
                    if (args.data && typeof args.data === 'object' && !Array.isArray(args.data)) {
                        if (!('id' in args.data) || args.data.id === undefined || args.data.id === null) {
                            args.data.id = (0, uuidv7_1.uuidv7)();
                        }
                    }
                    return query(args);
                },
                async createMany({ args, query }) {
                    if (Array.isArray(args.data)) {
                        args.data.forEach((item) => {
                            if (!('id' in item) || item.id === undefined || item.id === null) {
                                item.id = (0, uuidv7_1.uuidv7)();
                            }
                        });
                    }
                    return query(args);
                }
            },
        },
    });
};
const globalForPrisma = globalThis;
exports.prisma = globalForPrisma.prisma ?? prismaClientSingleton();
if (process.env.NODE_ENV !== 'production')
    globalForPrisma.prisma = exports.prisma;
