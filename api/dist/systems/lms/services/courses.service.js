"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoursesService = void 0;
const prisma_1 = require("../../../lib/prisma");
class CoursesService {
    async create(data) {
        return prisma_1.prisma.course.create({
            data,
        });
    }
    async findAll(params) {
        const { skip, take, cursor, where, orderBy } = params;
        return prisma_1.prisma.course.findMany({
            skip,
            take,
            cursor,
            where,
            orderBy,
            include: {
                author: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
            },
        });
    }
    async findOne(id) {
        return prisma_1.prisma.course.findUnique({
            where: { id },
            include: {
                author: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
                modules: {
                    include: {
                        lessons: true,
                    },
                    orderBy: {
                        order: 'asc',
                    },
                },
            },
        });
    }
    async findBySlug(slug) {
        return prisma_1.prisma.course.findUnique({
            where: { slug },
            include: {
                author: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                    },
                },
                modules: {
                    include: {
                        lessons: true,
                    },
                    orderBy: {
                        order: 'asc',
                    },
                },
            },
        });
    }
    async update(params) {
        const { where, data } = params;
        return prisma_1.prisma.course.update({
            data,
            where,
        });
    }
    async delete(where) {
        return prisma_1.prisma.course.delete({
            where,
        });
    }
    async enroll(userId, courseId) {
        return prisma_1.prisma.enrollment.create({
            data: {
                userId,
                courseId,
            },
        });
    }
    async getMyCourses(userId) {
        return prisma_1.prisma.enrollment.findMany({
            where: { userId },
            include: {
                course: {
                    include: {
                        author: {
                            select: {
                                fullName: true,
                            },
                        },
                    },
                },
            },
        });
    }
    async updateProgress(userId, lessonId, completed) {
        const lesson = await prisma_1.prisma.lesson.findUnique({
            where: { id: lessonId },
            include: { module: { include: { course: true } } },
        });
        if (!lesson)
            throw new Error('Lesson not found');
        const enrollment = await prisma_1.prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId: lesson.module.courseId,
                },
            },
        });
        if (!enrollment)
            throw new Error('User not enrolled in this course');
        return prisma_1.prisma.lessonProgress.upsert({
            where: {
                enrollmentId_lessonId: {
                    enrollmentId: enrollment.id,
                    lessonId,
                },
            },
            update: {
                isCompleted: completed,
                completedAt: completed ? new Date() : null,
            },
            create: {
                enrollmentId: enrollment.id,
                lessonId,
                isCompleted: completed,
                completedAt: completed ? new Date() : null,
            },
        });
    }
}
exports.CoursesService = CoursesService;
