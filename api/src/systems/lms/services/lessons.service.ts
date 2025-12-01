import { Lesson, Prisma } from '@prisma/client';
import { prisma } from '../../../lib/prisma';

export class LessonsService {
    async create(data: Prisma.LessonCreateInput): Promise<Lesson> {
        return prisma.lesson.create({
            data,
        });
    }

    async findAll(moduleId: string): Promise<Lesson[]> {
        return prisma.lesson.findMany({
            where: { moduleId },
            orderBy: { order: 'asc' }
        });
    }

    async findOne(id: string): Promise<Lesson | null> {
        return prisma.lesson.findUnique({
            where: { id },
            include: { module: true }
        });
    }

    async update(id: string, data: Prisma.LessonUpdateInput): Promise<Lesson> {
        return prisma.lesson.update({
            where: { id },
            data,
        });
    }

    async delete(id: string): Promise<Lesson> {
        return prisma.lesson.delete({
            where: { id },
        });
    }

    async reorder(moduleId: string, lessonIds: string[]): Promise<void> {
        const transaction = lessonIds.map((id, index) =>
            prisma.lesson.update({
                where: { id },
                data: { order: index }
            })
        );
        await prisma.$transaction(transaction);
    }
}
