import { Lesson, Prisma } from '@prisma/client';
import { prisma } from '../../../lib/prisma';

export class LessonsService {
    private generateSlug(title: string): string {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            + '-' + Math.random().toString(36).substring(2, 9);
    }

    async create(moduleId: string, lessonData: {
        title: string;
        type: string;
        content?: string;
        videoUrl?: string;
        resourceUrl?: string;
        duration?: number;
        isFree?: boolean;
        order?: number;
    }): Promise<Lesson> {
        console.log('=== LessonsService.create ===');
        console.log('moduleId:', moduleId);
        console.log('lessonData:', JSON.stringify(lessonData, null, 2));

        const slug = this.generateSlug(lessonData.title);
        console.log('Generated slug:', slug);

        const prismaData = {
            title: lessonData.title,
            slug,
            type: lessonData.type,
            content: lessonData.content || null,
            videoUrl: lessonData.videoUrl || null,
            resourceUrl: lessonData.resourceUrl || null,
            duration: lessonData.duration || 0,
            isFree: lessonData.isFree || false,
            order: lessonData.order || 0,
            module: {
                connect: { id: moduleId }
            }
        };

        console.log('Prisma data:', JSON.stringify(prismaData, null, 2));

        return prisma.lesson.create({
            data: prismaData,
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
