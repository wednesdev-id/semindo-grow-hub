import { Module, Prisma } from '../../../../prisma/generated/client';
import { prisma } from '../../../lib/prisma';

export class ModulesService {
    async create(data: Prisma.ModuleCreateInput): Promise<Module> {
        return prisma.module.create({
            data,
        });
    }

    async findAll(courseId: string): Promise<Module[]> {
        return prisma.module.findMany({
            where: { courseId },
            orderBy: { order: 'asc' },
            include: { lessons: true }
        });
    }

    async findOne(id: string): Promise<Module | null> {
        return prisma.module.findUnique({
            where: { id },
            include: { lessons: true }
        });
    }

    async update(id: string, data: Prisma.ModuleUpdateInput): Promise<Module> {
        return prisma.module.update({
            where: { id },
            data,
        });
    }

    async delete(id: string): Promise<Module> {
        return prisma.module.delete({
            where: { id },
        });
    }

    async reorder(courseId: string, moduleIds: string[]): Promise<void> {
        const transaction = moduleIds.map((id, index) =>
            prisma.module.update({
                where: { id },
                data: { order: index }
            })
        );
        await prisma.$transaction(transaction);
    }
}
