import { db } from '../utils/db'
import { Assessment, AssessmentResponse } from '@prisma/client'
import { RecommendationService } from './recommendation.service'

export class AssessmentService {
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

        // Calculate Score
        let totalWeight = 0
        let totalScore = 0
        const categoryScores: Record<string, { name: string, score: number, maxScore: number }> = {}

        for (const response of assessment.responses) {
            const question = response.question
            const weight = Number(question.weight)
            const categoryId = question.categoryId
            const categoryName = question.category.name

            // Initialize category score
            if (!categoryScores[categoryId]) {
                categoryScores[categoryId] = { name: categoryName, score: 0, maxScore: 0 }
            }

            // Simple scoring logic for now (assuming 1-5 scale or similar)
            // This needs to be refined based on question type
            let scoreValue = 0
            if (typeof response.answerValue === 'number') {
                scoreValue = response.answerValue
            } else if (typeof response.answerValue === 'object' && response.answerValue !== null) {
                // Handle other types
                scoreValue = (response.answerValue as any).value || 0
            }

            // Normalize to 0-100 for this question
            // Assuming max raw score is 5
            const normalizedScore = (scoreValue / 5) * 100

            totalScore += normalizedScore * weight
            totalWeight += weight

            categoryScores[categoryId].score += normalizedScore * weight
            categoryScores[categoryId].maxScore += 100 * weight
        }

        const finalScore = totalWeight > 0 ? totalScore / totalWeight : 0

        // Determine Level
        let umkmLevel = 'mikro'
        if (finalScore > 70) umkmLevel = 'menengah'
        else if (finalScore > 40) umkmLevel = 'kecil'

        // Save Score
        // Check if score already exists (e.g. re-submit)
        const existingScore = await db.assessmentScore.findUnique({ where: { assessmentId: id } })
        let savedScore;

        if (existingScore) {
            savedScore = await db.assessmentScore.update({
                where: { assessmentId: id },
                data: {
                    totalScore: finalScore,
                    umkmLevel,
                    categoryScores: categoryScores as any,
                    calculatedAt: new Date()
                }
            })
        } else {
            savedScore = await db.assessmentScore.create({
                data: {
                    assessmentId: id,
                    totalScore: finalScore,
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
