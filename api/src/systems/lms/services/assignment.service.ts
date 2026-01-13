import { Prisma, Assignment, AssignmentSubmission } from '../../../../prisma/generated/client';
import { prisma } from '../../../lib/prisma';
import { CoursesService } from './courses.service';

const coursesService = new CoursesService();

export class AssignmentService {
    async createAssignment(lessonId: string, data: {
        title: string;
        description: string;
        dueDate?: Date | string;
    }) {
        return prisma.assignment.create({
            data: {
                lessonId,
                title: data.title,
                description: data.description,
                dueDate: data.dueDate ? new Date(data.dueDate) : null
            }
        });
    }

    async getAssignment(lessonId: string) {
        return prisma.assignment.findUnique({
            where: { lessonId }
        });
    }

    async submitAssignment(userId: string, assignmentId: string, data: {
        fileUrl?: string;
        content?: string;
    }) {
        const submission = await prisma.assignmentSubmission.create({
            data: {
                assignmentId,
                userId,
                fileUrl: data.fileUrl,
                content: data.content,
                status: 'submitted'
            }
        });

        // Auto-mark lesson as completed? Maybe not for assignment, usually waits for grading.
        // But for now let's keep it manual grading.

        return submission;
    }

    async gradeAssignment(submissionId: string, grade: number, feedback?: string) {
        const submission = await prisma.assignmentSubmission.update({
            where: { id: submissionId },
            data: {
                grade,
                feedback,
                status: 'graded',
                gradedAt: new Date()
            },
            include: { assignment: true }
        });

        // If grade is passing (e.g. > 70), mark lesson as completed
        if (grade >= 70) {
            await coursesService.updateProgress(submission.userId, submission.assignment.lessonId, true);
        }

        return submission;
    }

    async getSubmissions(assignmentId: string) {
        return prisma.assignmentSubmission.findMany({
            where: { assignmentId },
            include: { user: { select: { id: true, fullName: true, email: true } } },
            orderBy: { submittedAt: 'desc' }
        });
    }

    async getUserSubmission(assignmentId: string, userId: string) {
        return prisma.assignmentSubmission.findFirst({
            where: { assignmentId, userId },
            orderBy: { submittedAt: 'desc' }
        });
    }
}
