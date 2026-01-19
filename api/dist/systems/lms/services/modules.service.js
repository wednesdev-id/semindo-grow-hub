"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModulesService = void 0;
const prisma_1 = require("../../../lib/prisma");
class ModulesService {
    async create(data) {
        return prisma_1.prisma.module.create({
            data,
        });
    }
    async findAll(courseId) {
        return prisma_1.prisma.module.findMany({
            where: { courseId },
            orderBy: { order: 'asc' },
            include: { lessons: true }
        });
    }
    async findOne(id) {
        return prisma_1.prisma.module.findUnique({
            where: { id },
            include: { lessons: true }
        });
    }
    async update(id, data) {
        return prisma_1.prisma.module.update({
            where: { id },
            data,
        });
    }
    async delete(id) {
        return prisma_1.prisma.module.delete({
            where: { id },
        });
    }
    async reorder(courseId, moduleIds) {
        const transaction = moduleIds.map((id, index) => prisma_1.prisma.module.update({
            where: { id },
            data: { order: index }
        }));
        await prisma_1.prisma.$transaction(transaction);
    }
}
exports.ModulesService = ModulesService;
