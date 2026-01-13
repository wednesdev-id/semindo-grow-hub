import { PrismaClient } from '../../prisma/generated/client';
import { uuidv7 } from 'uuidv7';

const prismaClientSingleton = () => {
    const logOptions = process.env.NODE_ENV !== 'production'
        ? { log: ['query', 'info', 'warn', 'error'] as ('query' | 'info' | 'warn' | 'error')[] }
        : { log: ['warn', 'error'] as ('warn' | 'error')[] };

    // Prisma 7 requires datasourceUrl to be passed to PrismaClient constructor
    return new PrismaClient({
        ...logOptions,
        datasourceUrl: process.env.DATABASE_URL,
    }).$extends({
        query: {
            $allModels: {
                async create({ args, query, model }) {
                    // Skip models with composite keys (no id field)
                    const compositeKeyModels = ['UserRole', 'RolePermission', 'ProgramParticipant', 'EventRegistration'];
                    if (compositeKeyModels.includes(model as string)) {
                        return query(args);
                    }

                    if (args.data && typeof args.data === 'object' && !Array.isArray(args.data)) {
                        if (!('id' in args.data) || args.data.id === undefined || args.data.id === null) {
                            (args.data as any).id = uuidv7();
                        }
                    }
                    return query(args);
                },
                async createMany({ args, query, model }) {
                    // Skip models with composite keys
                    const compositeKeyModels = ['UserRole', 'RolePermission', 'ProgramParticipant', 'EventRegistration'];
                    if (compositeKeyModels.includes(model as string)) {
                        return query(args);
                    }

                    if (Array.isArray(args.data)) {
                        args.data.forEach((item: any) => {
                            if (!('id' in item) || item.id === undefined || item.id === null) {
                                item.id = uuidv7();
                            }
                        });
                    }
                    return query(args);
                }
            },
        },
    });
};

type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClientSingleton | undefined;
};

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
