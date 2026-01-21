"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.courseCategoryService = exports.CourseCategoryService = void 0;
const prisma_1 = require("../../../lib/prisma");
class CourseCategoryService {
    async findAll() {
        return prisma_1.prisma.courseCategory.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { courses: true }
                }
            }
        });
    }
    async findById(id) {
        return prisma_1.prisma.courseCategory.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { courses: true }
                }
            }
        });
    }
    async create(data) {
        const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return prisma_1.prisma.courseCategory.create({
            data: {
                ...data,
                slug
            }
        });
    }
    async update(id, data) {
        const updateData = { ...data };
        if (data.name) {
            updateData.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }
        return prisma_1.prisma.courseCategory.update({
            where: { id },
            data: updateData
        });
    }
    async delete(id) {
        return prisma_1.prisma.courseCategory.delete({
            where: { id }
        });
    }
}
exports.CourseCategoryService = CourseCategoryService;
exports.courseCategoryService = new CourseCategoryService();
