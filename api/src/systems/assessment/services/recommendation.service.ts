import { PrismaClient, AssessmentScore, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

export class RecommendationService {
    static async generateRecommendations(assessmentId: string, score: AssessmentScore) {
        // 1. Get the assessment to find the templateId
        const assessment = await prisma.assessment.findUnique({
            where: { id: assessmentId },
            include: { template: true }
        })

        if (!assessment || !assessment.templateId) {
            throw new Error('Assessment or Template not found')
        }

        // 2. Get all rules for this template
        const rules = await prisma.recommendationRule.findMany({
            where: { templateId: assessment.templateId }
        })

        const recommendationsToCreate: Prisma.AssessmentRecommendationCreateManyInput[] = []

        // 3. Evaluate rules
        for (const rule of rules) {
            let isMatch = false

            if (rule.categoryId) {
                // Category-specific rule
                // score.categoryScores is stored as Record<categoryId, { score, maxScore, name }>
                const categoryScores = score.categoryScores as Record<string, any> || {}
                const catScoreData = categoryScores[rule.categoryId]

                if (catScoreData) {
                    // Calculate percentage
                    const percentage = catScoreData.maxScore > 0 ? (catScoreData.score / catScoreData.maxScore) * 100 : 0

                    if (
                        (rule.minScore === null || percentage >= Number(rule.minScore)) &&
                        (rule.maxScore === null || percentage <= Number(rule.maxScore))
                    ) {
                        isMatch = true
                    }
                }
            } else {
                // General rule based on total score
                const totalScore = Number(score.totalScore)
                if (
                    (rule.minScore === null || totalScore >= Number(rule.minScore)) &&
                    (rule.maxScore === null || totalScore <= Number(rule.maxScore))
                ) {
                    isMatch = true
                }
            }

            if (isMatch) {
                recommendationsToCreate.push({
                    assessmentId: assessmentId,
                    title: rule.title,
                    description: rule.description,
                    priority: rule.priority,
                    category: rule.categoryId ? (await this.getCategoryName(rule.categoryId)) : 'General',
                    actionItems: rule.actionItems ?? [],
                    resources: rule.resources ?? []
                })
            }
        }

        // 4. Save recommendations
        if (recommendationsToCreate.length > 0) {
            await prisma.assessmentRecommendation.createMany({
                data: recommendationsToCreate
            })
        }

        return recommendationsToCreate
    }

    private static async getCategoryName(categoryId: string): Promise<string> {
        const category = await prisma.assessmentCategory.findUnique({
            where: { id: categoryId }
        })
        return category ? category.name : 'General'
    }
}
