import { Course, Prisma, Enrollment, LessonProgress } from '@prisma/client';
import { prisma } from '../../../lib/prisma';

export class CoursesService {
    async create(data: Prisma.CourseCreateInput): Promise<Course> {
        return prisma.course.create({
            data,
        });
    }

    async findAll(params: {
        skip?: number;
        take?: number;
        cursor?: Prisma.CourseWhereUniqueInput;
        where?: Prisma.CourseWhereInput;
        orderBy?: Prisma.CourseOrderByWithRelationInput;
    }): Promise<Course[]> {
        const { skip, take, cursor, where, orderBy } = params;
        return prisma.course.findMany({
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

    async findOne(id: string): Promise<Course | null> {
        return prisma.course.findUnique({
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

    async findBySlug(slug: string): Promise<Course | null> {
        return prisma.course.findUnique({
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

    async update(params: {
        where: Prisma.CourseWhereUniqueInput;
        data: Prisma.CourseUpdateInput;
    }): Promise<Course> {
        const { where, data } = params;
        return prisma.course.update({
            data,
            where,
        });
    }

    async delete(where: Prisma.CourseWhereUniqueInput): Promise<Course> {
        return prisma.course.delete({
            where,
        });
    }

    async enroll(userId: string, courseId: string): Promise<Enrollment> {
        return prisma.enrollment.create({
            data: {
                userId,
                courseId,
            },
        });
    }

    async getMyCourses(userId: string): Promise<Enrollment[]> {
        return prisma.enrollment.findMany({
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

    async updateProgress(
        userId: string,
        lessonId: string,
        completed: boolean
    ): Promise<LessonProgress> {
        const lesson = await prisma.lesson.findUnique({
            where: { id: lessonId },
            include: { module: { include: { course: true } } },
        });

        if (!lesson) throw new Error('Lesson not found');

        const enrollment = await prisma.enrollment.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId: lesson.module.courseId,
                },
            },
        });

        if (!enrollment) throw new Error('User not enrolled in this course');

        return prisma.lessonProgress.upsert({
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
