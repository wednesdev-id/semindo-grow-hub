"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LessonsService = void 0;
const prisma_1 = require("../../../lib/prisma");
class LessonsService {
    generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            + '-' + Math.random().toString(36).substring(2, 9);
    }
    async create(moduleId, lessonData) {
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
        return prisma_1.prisma.lesson.create({
            data: prismaData,
        });
    }
    async findAll(moduleId) {
        return prisma_1.prisma.lesson.findMany({
            where: { moduleId },
            orderBy: { order: 'asc' }
        });
    }
    async findOne(id) {
        return prisma_1.prisma.lesson.findUnique({
            where: { id },
            include: { module: true }
        });
    }
    async update(id, data) {
        return prisma_1.prisma.lesson.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        return prisma_1.prisma.lesson.delete({
            where: { id },
        });
    }
    async reorder(moduleId, lessonIds) {
        const transaction = lessonIds.map((id, index) => prisma_1.prisma.lesson.update({
            where: { id },
            data: { order: index }
        }));
        await prisma_1.prisma.$transaction(transaction);
    }
}
exports.LessonsService = LessonsService;
