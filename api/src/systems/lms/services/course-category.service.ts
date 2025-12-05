import { PrismaClient, CourseCategory } from '@prisma/client';

const prisma = new PrismaClient();

export class CourseCategoryService {
    async findAll() {
        return prisma.courseCategory.findMany({
            orderBy: { name: 'asc' },
            include: {
                _count: {
                    select: { courses: true }
                }
            }
        });
    }

    async findById(id: string) {
        return prisma.courseCategory.findUnique({
            where: { id },
            include: {
                _count: {
                    select: { courses: true }
                }
            }
        });
    }

    async create(data: { name: string; description?: string }) {
        const slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        return prisma.courseCategory.create({
            data: {
                ...data,
                slug
            }
        });
    }

    async update(id: string, data: { name?: string; description?: string }) {
        const updateData: any = { ...data };
        if (data.name) {
            updateData.slug = data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        }
        return prisma.courseCategory.update({
            where: { id },
            data: updateData
        });
    }

    async delete(id: string) {
        return prisma.courseCategory.delete({
            where: { id }
        });
    }
}

export const courseCategoryService = new CourseCategoryService();
