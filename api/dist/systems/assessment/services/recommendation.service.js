"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecommendationService = void 0;
const db_1 = require("../../utils/db");
class RecommendationService {
    static async generateRecommendations(assessmentId, score) {
        // 1. Get the assessment to find the templateId
        const assessment = await db_1.db.assessment.findUnique({
            where: { id: assessmentId },
            include: { template: true }
        });
        if (!assessment || !assessment.templateId) {
            throw new Error('Assessment or Template not found');
        }
        // 2. Get all rules for this template
        const rules = await db_1.db.recommendationRule.findMany({
            where: { templateId: assessment.templateId }
        });
        // Pre-fetch categories to avoid N+1
        const categories = await db_1.db.assessmentCategory.findMany();
        const categoryMap = new Map(categories.map(c => [c.id, c.name]));
        const recommendationsToCreate = [];
        // 3. Evaluate rules
        for (const rule of rules) {
            let isMatch = false;
            if (rule.categoryId) {
                // Category-specific rule
                // score.categoryScores is stored as Record<categoryId, { score, maxScore, name }>
                const categoryScores = score.categoryScores || {};
                const catScoreData = categoryScores[rule.categoryId];
                if (catScoreData) {
                    // Calculate percentage
                    const percentage = catScoreData.maxScore > 0 ? (catScoreData.score / catScoreData.maxScore) * 100 : 0;
                    if ((rule.minScore === null || percentage >= Number(rule.minScore)) &&
                        (rule.maxScore === null || percentage <= Number(rule.maxScore))) {
                        isMatch = true;
                    }
                }
            }
            else {
                // General rule based on total score
                const totalScore = Number(score.totalScore);
                if ((rule.minScore === null || totalScore >= Number(rule.minScore)) &&
                    (rule.maxScore === null || totalScore <= Number(rule.maxScore))) {
                    isMatch = true;
                }
            }
            if (isMatch) {
                recommendationsToCreate.push({
                    assessmentId: assessmentId,
                    title: rule.title,
                    description: rule.description,
                    priority: rule.priority,
                    category: rule.categoryId ? (categoryMap.get(rule.categoryId) || 'General') : 'General',
                    actionItems: rule.actionItems ?? [],
                    resources: rule.resources ?? []
                });
            }
        }
        // 4. Save recommendations
        if (recommendationsToCreate.length > 0) {
            await db_1.db.assessmentRecommendation.createMany({
                data: recommendationsToCreate
            });
        }
        return recommendationsToCreate;
    }
}
exports.RecommendationService = RecommendationService;
