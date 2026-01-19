"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LessonsService = void 0;
const prisma_1 = require("../../../lib/prisma");
class LessonsService {
    async create(data) {
        return prisma_1.prisma.lesson.create({
            data,
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
