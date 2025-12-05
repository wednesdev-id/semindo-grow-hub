import { Prisma, Quiz, QuizAttempt, QuizQuestion } from '@prisma/client';
import { prisma } from '../../../lib/prisma';
import { CoursesService } from './courses.service';

const coursesService = new CoursesService();

export class QuizService {
    async createQuiz(lessonId: string, data: {
        title: string;
        description?: string;
        timeLimit?: number;
        passingScore?: number;
        questions: {
            text: string;
            type: string;
            options?: any;
            points?: number;
            order?: number;
        }[];
    }) {
        return prisma.$transaction(async (tx) => {
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

    async getQuiz(lessonId: string) {
        return prisma.quiz.findUnique({
            where: { lessonId },
            include: {
                questions: {
                    orderBy: { order: 'asc' }
                }
            }
        });
    }

    async submitQuiz(userId: string, quizId: string, answers: Record<string, any>) {
        const quiz = await prisma.quiz.findUnique({
            where: { id: quizId },
            include: { questions: true }
        });

        if (!quiz) throw new Error('Quiz not found');

        let totalScore = 0;
        let maxScore = 0;

        // Calculate score
        quiz.questions.forEach(question => {
            maxScore += question.points;
            const userAnswer = answers[question.id];

            if (question.type === 'multiple_choice' || question.type === 'boolean') {
                const correctOption = (question.options as any[])?.find((opt: any) => opt.isCorrect);
                if (correctOption && userAnswer === correctOption.text) {
                    totalScore += question.points;
                }
            }
            // Text questions might need manual grading or specific logic, skipping for now or assuming correct if matched exactly
        });

        const scorePercentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
        const isPassed = scorePercentage >= quiz.passingScore;

        const attempt = await prisma.quizAttempt.create({
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

    async getAttempts(userId: string, quizId: string) {
        return prisma.quizAttempt.findMany({
            where: { userId, quizId },
            orderBy: { startedAt: 'desc' }
        });
    }
}
