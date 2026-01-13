import { Request, Response } from 'express';
import { CoursesService } from '../services/courses.service';
import { Prisma } from '../../../../prisma/generated/client';

const coursesService = new CoursesService();

export class CoursesController {
    async create(req: Request, res: Response) {
        try {
            const userId = (req as any).user.userId as string;
            const data: Prisma.CourseCreateInput = {
                ...req.body,
                author: { connect: { id: userId } },
                slug: req.body.title.toLowerCase().replace(/ /g, '-') + '-' + Date.now(),
            };
            const course = await coursesService.create(data);
            res.status(201).json({ data: course });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async findAll(req: Request, res: Response) {
        try {
            const { skip, take, category, level, search } = req.query;

            const where: Prisma.CourseWhereInput = {};
            if (category) where.category = String(category);
            if (level) where.level = String(level);
            if (search) {
                where.OR = [
                    { title: { contains: String(search), mode: 'insensitive' } },
                    { description: { contains: String(search), mode: 'insensitive' } },
                ];
            }

            const courses = await coursesService.findAll({
                skip: skip ? Number(skip) : undefined,
                take: take ? Number(take) : undefined,
                where,
                orderBy: { createdAt: 'desc' },
            });
            res.json({ data: courses });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async findOne(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const course = await coursesService.findOne(id);
            if (!course) return res.status(404).json({ error: 'Course not found' });
            res.json({ data: course });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async findBySlug(req: Request, res: Response) {
        try {
            const { slug } = req.params;
            const course = await coursesService.findBySlug(slug);
            if (!course) return res.status(404).json({ error: 'Course not found' });
            res.json({ data: course });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const data = req.body;
            const course = await coursesService.update({
                where: { id },
                data,
            });
            res.json({ data: course });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await coursesService.delete({ id });
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async enroll(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.userId;
            const { id } = req.params; // courseId

            console.log('=== ENROLLMENT REQUEST ===');
            console.log('User ID:', userId);
            console.log('Course ID:', id);
            console.log('Full user object:', (req as any).user);

            if (!userId) {
                console.error('=== ENROLLMENT ERROR: No userId ===');
                return res.status(400).json({
                    error: 'User ID not found in token',
                    code: 'MISSING_USER_ID'
                });
            }

            const enrollment = await coursesService.enroll(userId, id);

            console.log('Enrollment successful:', enrollment.id);
            res.status(201).json({ data: enrollment });
        } catch (error: any) {
            console.error('=== ENROLLMENT ERROR ===');
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);

            // Return user-friendly error message
            res.status(400).json({
                error: error.message || 'Failed to enroll in course',
                code: 'ENROLLMENT_FAILED'
            });
        }
    }

    async getMyCourses(req: Request, res: Response) {
        try {
            const userId = (req as any).user.userId as string;
            const courses = await coursesService.getMyCourses(userId);
            res.json({ data: courses });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async updateProgress(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.userId;
            const { id } = req.params; // lessonId
            const { completed } = req.body;
            const progress = await coursesService.updateProgress(userId, id, completed);
            res.json({ data: progress });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async checkEnrollment(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.userId;
            const { id } = req.params; // courseId

            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const result = await coursesService.checkEnrollment(userId, id);
            res.json({ data: result });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async getInstructorCourses(req: Request, res: Response) {
        try {
            const userId = (req as any).user.userId as string;
            const courses = await coursesService.getInstructorCourses(userId);
            res.json({ data: courses });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async getInstructorStats(req: Request, res: Response) {
        try {
            const userId = (req as any).user.userId as string;
            const stats = await coursesService.getInstructorStats(userId);
            res.json({ data: stats });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
