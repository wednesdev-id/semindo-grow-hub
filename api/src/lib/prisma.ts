import { PrismaClient } from '../../prisma/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { uuidv7 } from 'uuidv7';

const prismaClientSingleton = () => {
    // Create pg Pool with DATABASE_URL
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error('DATABASE_URL environment variable is not set');
    }

    const pool = new Pool({ connectionString });
    console.log(`[DEBUG] Connecting to DB with URL: ${connectionString.replace(/:([^@]+)@/, ':****@')}`);
    const adapter = new PrismaPg(pool);

    const logOptions = process.env.NODE_ENV !== 'production'
        ? { log: ['query', 'info', 'warn', 'error'] as ('query' | 'info' | 'warn' | 'error')[] }
        : { log: ['warn', 'error'] as ('warn' | 'error')[] };

    // Prisma 7: Use adapter for database connection
    return new PrismaClient({
        adapter,
        ...logOptions,
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
