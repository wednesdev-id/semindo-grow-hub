"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizService = void 0;
const prisma_1 = require("../../../lib/prisma");
const courses_service_1 = require("./courses.service");
const coursesService = new courses_service_1.CoursesService();
class QuizService {
    async createQuiz(lessonId, data) {
        return prisma_1.prisma.$transaction(async (tx) => {
            const quiz = await tx.quiz.create({
                data: {
                    lessonId,
                    title: data.title,
                    description: data.description,
                    timeLimit: data.timeLimit,
                    passingScore: data.passingScore,
                    questions: {
                        create: data.questions.map(q => ({
                            text: q.text,
                            type: q.type,
                            options: q.options,
                            points: q.points,
                            order: q.order
                        }))
                    }
                },
                include: {
                    questions: true
                }
            });
            return quiz;
        });
    }
    async getQuiz(lessonId) {
        return prisma_1.prisma.quiz.findUnique({
            where: { lessonId },
            include: {
                questions: {
                    orderBy: { order: 'asc' }
                }
            }
        });
    }
    async submitQuiz(userId, quizId, answers) {
        const quiz = await prisma_1.prisma.quiz.findUnique({
            where: { id: quizId },
            include: { questions: true }
        });
        if (!quiz)
            throw new Error('Quiz not found');
        let totalScore = 0;
        let maxScore = 0;
        // Calculate score
        quiz.questions.forEach(question => {
            maxScore += question.points;
            const userAnswer = answers[question.id];
            if (question.type === 'multiple_choice' || question.type === 'boolean') {
                const correctOption = question.options?.find((opt) => opt.isCorrect);
                if (correctOption && userAnswer === correctOption.text) {
                    totalScore += question.points;
                }
            }
            // Text questions might need manual grading or specific logic, skipping for now or assuming correct if matched exactly
        });
        const scorePercentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
        const isPassed = scorePercentage >= quiz.passingScore;
        const attempt = await prisma_1.prisma.quizAttempt.create({
            data: {
                quizId,
                userId,
                score: Math.round(scorePercentage),
                isPassed,
                answers,
                completedAt: new Date()
            }
        });
        if (isPassed) {
            await coursesService.updateProgress(userId, quiz.lessonId, true);
        }
        return attempt;
    }
    async getAttempts(userId, quizId) {
        return prisma_1.prisma.quizAttempt.findMany({
            where: { userId, quizId },
            orderBy: { startedAt: 'desc' }
        });
    }
}
exports.QuizService = QuizService;
