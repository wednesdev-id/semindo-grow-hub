import { PrismaClient, Course, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

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
}
