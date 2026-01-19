"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssignmentService = void 0;
const prisma_1 = require("../../../lib/prisma");
const courses_service_1 = require("./courses.service");
const coursesService = new courses_service_1.CoursesService();
class AssignmentService {
    async createAssignment(lessonId, data) {
        return prisma_1.prisma.assignment.create({
            data: {
                lessonId,
                title: data.title,
                description: data.description,
                dueDate: data.dueDate ? new Date(data.dueDate) : null
            }
        });
    }
    async getAssignment(lessonId) {
        return prisma_1.prisma.assignment.findUnique({
            where: { lessonId }
        });
    }
    async submitAssignment(userId, assignmentId, data) {
        const submission = await prisma_1.prisma.assignmentSubmission.create({
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
    async gradeAssignment(submissionId, grade, feedback) {
        const submission = await prisma_1.prisma.assignmentSubmission.update({
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
    async getSubmissions(assignmentId) {
        return prisma_1.prisma.assignmentSubmission.findMany({
            where: { assignmentId },
            include: { user: { select: { id: true, fullName: true, email: true } } },
            orderBy: { submittedAt: 'desc' }
        });
    }
    async getUserSubmission(assignmentId, userId) {
        return prisma_1.prisma.assignmentSubmission.findFirst({
            where: { assignmentId, userId },
            orderBy: { submittedAt: 'desc' }
        });
    }
}
exports.AssignmentService = AssignmentService;
