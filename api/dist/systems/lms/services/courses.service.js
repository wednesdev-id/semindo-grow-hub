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
        // Check if user is already enrolled
        const existingEnrollment = await prisma_1.prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId,
                },
            },
        });
        if (existingEnrollment) {
            throw new Error('You are already enrolled in this course');
        }
        // Check if course exists
        const course = await prisma_1.prisma.course.findUnique({
            where: { id: courseId },
        });
        if (!course) {
            throw new Error('Course not found');
        }
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
    async checkEnrollment(userId, courseId) {
        const enrollment = await prisma_1.prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId,
                },
            },
            include: {
                course: {
                    include: {
                        modules: {
                            include: {
                                lessons: {
                                    orderBy: { order: 'asc' }
                                }
                            },
                            orderBy: { order: 'asc' }
                        }
                    }
                }
            }
        });
        return {
            isEnrolled: !!enrollment,
            enrollment: enrollment || undefined
        };
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
        const lessonProgress = await prisma_1.prisma.lessonProgress.upsert({
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
        // Recalculate Course Progress
        const totalLessons = await prisma_1.prisma.lesson.count({
            where: {
                module: {
                    courseId: lesson.module.courseId
                }
            }
        });
        const completedLessons = await prisma_1.prisma.lessonProgress.count({
            where: {
                enrollmentId: enrollment.id,
                isCompleted: true
            }
        });
        const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;
        await prisma_1.prisma.enrollment.update({
            where: { id: enrollment.id },
            data: { progress: progressPercentage }
        });
        return lessonProgress;
    }
    async getInstructorCourses(userId) {
        return prisma_1.prisma.course.findMany({
            where: { authorId: userId },
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: { enrollments: true }
                }
            }
        });
    }
    async getInstructorStats(userId) {
        const courses = await prisma_1.prisma.course.findMany({
            where: { authorId: userId },
            include: {
                _count: {
                    select: { enrollments: true }
                }
            }
        });
        const totalCourses = courses.length;
        const totalStudents = courses.reduce((acc, course) => acc + course._count.enrollments, 0);
        // Commission Logic
        // If < 5 courses, deduction 30%
        // If >= 5 courses, deduction 15%
        const deductionRate = totalCourses >= 5 ? 0.15 : 0.30;
        return {
            totalCourses,
            totalStudents,
            deductionRate,
            deductionPercentage: deductionRate * 100
        };
    }
}
exports.CoursesService = CoursesService;
