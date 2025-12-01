import { db } from '../../utils/db';
import { PrismaClient, Assessment, AssessmentQuestion, AssessmentResponse, AssessmentScore } from '@prisma/client';
import { RecommendationService } from './recommendation.service'
import { ScoringEngine } from './scoring.service'
import { LevelDeterminationService } from './level.service'

export class AssessmentService {
    async getTemplates() {
        return db.assessmentTemplate.findMany({
            where: { isActive: true },
            include: {
                questions: {
                    orderBy: { order: 'asc' }
                }
            }
        })
    }

    async getTemplatesByCategory(category: string) {
        return db.assessmentTemplate.findMany({
            where: {
                isActive: true,
                category: category
            },
            include: {
                questions: {
                    orderBy: { order: 'asc' }
                }
            }
        })
    }

    async createAssessment(userId: string, templateId?: string) {
        // If no template provided, use the default active one
        let targetTemplateId = templateId
        if (!targetTemplateId) {
            const defaultTemplate = await db.assessmentTemplate.findFirst({
                where: { isActive: true }
            })
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

        return db.assessmentResponse.upsert({
            where: {
                assessmentId_questionId: { // This composite unique constraint needs to be added to schema if not exists, or handle differently
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
        await RecommendationService.generateRecommendations(id, savedScore)

        return this.getAssessment(id, userId)
    }
}
