"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const client_1 = require("../../prisma/generated/client");
const adapter_pg_1 = require("@prisma/adapter-pg");
const pg_1 = require("pg");
const uuidv7_1 = require("uuidv7");
const prismaClientSingleton = () => {
    // Create pg Pool with DATABASE_URL
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error('DATABASE_URL environment variable is not set');
    }
    const pool = new pg_1.Pool({ connectionString });
    const adapter = new adapter_pg_1.PrismaPg(pool);
    const logOptions = process.env.NODE_ENV !== 'production'
        ? { log: ['query', 'info', 'warn', 'error'] }
        : { log: ['warn', 'error'] };
    // Prisma 7: Use adapter for database connection
    return new client_1.PrismaClient({
        adapter,
        ...logOptions,
    }).$extends({
        query: {
            $allModels: {
                async create({ args, query, model }) {
                    // Skip models with composite keys (no id field)
                    const compositeKeyModels = ['UserRole', 'RolePermission', 'ProgramParticipant', 'EventRegistration'];
                    if (compositeKeyModels.includes(model)) {
                        return query(args);
                    }
                    if (args.data && typeof args.data === 'object' && !Array.isArray(args.data)) {
                        if (!('id' in args.data) || args.data.id === undefined || args.data.id === null) {
                            args.data.id = (0, uuidv7_1.uuidv7)();
                        }
                    }
                    return query(args);
                },
                async createMany({ args, query, model }) {
                    // Skip models with composite keys
                    const compositeKeyModels = ['UserRole', 'RolePermission', 'ProgramParticipant', 'EventRegistration'];
                    if (compositeKeyModels.includes(model)) {
                        return query(args);
                    }
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
