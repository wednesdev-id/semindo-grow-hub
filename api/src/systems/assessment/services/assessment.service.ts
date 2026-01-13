import { db } from '../../utils/db';
import { PrismaClient, Assessment, AssessmentQuestion, AssessmentResponse, AssessmentScore } from '../../../../prisma/generated/client';
import { RecommendationService } from './recommendation.service'
import { ScoringEngine } from './scoring.service'
import { LevelDeterminationService } from './level.service'
import { TemplateService } from './template.service'
import { ValidationService } from './validation.service'
import { ProblemMappingService } from './problem.service'

export class AssessmentService {
    async getTemplates() {
        return TemplateService.getTemplates();
    }

    async getTemplatesByCategory(category: string) {
        return TemplateService.getTemplatesByCategory(category);
    }

    async createAssessment(userId: string, templateId?: string) {
        // If no template provided, use the default active one
        let targetTemplateId = templateId
        if (!targetTemplateId) {
            const defaultTemplate = await TemplateService.getDefaultTemplate();
            if (defaultTemplate) {
                targetTemplateId = defaultTemplate.id
            }
        }

        return db.assessment.create({
            data: {
                userId,
                templateId: targetTemplateId,
                status: 'draft'
            },
            include: {
                template: {
                    include: {
                        questions: {
                            orderBy: { order: 'asc' },
                            include: {
                                category: true
                            }
                        }
                    }
                }
            }
        })
    }

    async getAssessment(id: string, userId: string) {
        const assessment = await db.assessment.findUnique({
            where: { id },
            include: {
                template: {
                    include: {
                        questions: {
                            orderBy: { order: 'asc' },
                            include: {
                                category: true
                            }
                        }
                    }
                },
                responses: true,
                score: true,
                recommendations: true
            }
        })

        if (!assessment) return null
        if (assessment.userId !== userId) throw new Error('Unauthorized')

        return assessment
    }

    async getUserAssessments(userId: string) {
        return db.assessment.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                score: true,
                template: true
            }
        })
    }

    async saveResponse(assessmentId: string, userId: string, questionId: string, answerValue: any) {
        const assessment = await db.assessment.findUnique({
            where: { id: assessmentId }
        })

        if (!assessment) throw new Error('Assessment not found')
        if (assessment.userId !== userId) throw new Error('Unauthorized')
        if (assessment.status === 'completed') throw new Error('Assessment already completed')

        // Validate Response
        const question = await db.assessmentQuestion.findUnique({ where: { id: questionId } });
        if (!question) throw new Error('Question not found');

        const validationError = ValidationService.validateResponse(question, answerValue);
        if (validationError) {
            throw new Error(`Validation failed: ${validationError.message}`);
        }

        return db.assessmentResponse.upsert({
            where: {
                assessmentId_questionId: {
                    assessmentId,
                    questionId
                }
            },
            update: {
                answerValue
            },
            create: {
                assessmentId,
                questionId,
                answerValue
            }
        })
    }

    async submitAssessment(id: string, userId: string) {
        const assessment = await db.assessment.findUnique({
            where: { id },
            include: {
                responses: {
                    include: {
                        question: {
                            include: {
                                category: true
                            }
                        }
                    }
                }
            }
        })

        if (!assessment) throw new Error('Assessment not found')
        if (assessment.userId !== userId) throw new Error('Unauthorized')

        // Calculate Score using ScoringEngine
        // Cast responses to the expected type as Prisma types can be slightly different
        const { totalScore, categoryScores } = ScoringEngine.calculateScore(assessment.responses as any);

        // Determine Level using LevelDeterminationService
        const umkmLevel = LevelDeterminationService.determineLevel(totalScore);

        // Identify Problems
        // We need a temporary score object to pass to ProblemMappingService
        const tempScore = {
            totalScore,
            categoryScores,
            umkmLevel
        } as any;

        const problems = ProblemMappingService.identifyProblems(assessment, tempScore, assessment.responses);

        // Save Score
        // Check if score already exists (e.g. re-submit)
        const existingScore = await db.assessmentScore.findUnique({ where: { assessmentId: id } })
        let savedScore;

        if (existingScore) {
            savedScore = await db.assessmentScore.update({
                where: { assessmentId: id },
                data: {
                    totalScore,
                    umkmLevel,
                    categoryScores: categoryScores as any,
                    calculatedAt: new Date()
                }
            })
        } else {
            savedScore = await db.assessmentScore.create({
                data: {
                    assessmentId: id,
                    totalScore,
                    umkmLevel,
                    confidenceScore: 0.9,
                    categoryScores: categoryScores as any
                }
            })
        }

        // Update Assessment Status
        await db.assessment.update({
            where: { id },
            data: {
                status: 'completed',
                completedAt: new Date()
            }
        })

        // Generate Recommendations
        // First delete existing recommendations if any (for re-submit)
        await db.assessmentRecommendation.deleteMany({ where: { assessmentId: id } })

        // Pass problems to recommendation service if needed, or let it generate based on score
        // For now, we'll stick to the existing rule-based generation but we could enhance it to use the identified problems
        await RecommendationService.generateRecommendations(id, savedScore)

        return this.getAssessment(id, userId)
    }
}
