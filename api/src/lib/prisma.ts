import { PrismaClient } from '@prisma/client';
import { uuidv7 } from 'uuidv7';

const prismaClientSingleton = () => {
    return new PrismaClient().$extends({
        query: {
            $allModels: {
                async create({ args, query }) {
                    if (args.data && typeof args.data === 'object' && !Array.isArray(args.data)) {
                        if (!('id' in args.data) || args.data.id === undefined || args.data.id === null) {
                            (args.data as any).id = uuidv7();
                        }
                    }
                    return query(args);
                },
                async createMany({ args, query }) {
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
