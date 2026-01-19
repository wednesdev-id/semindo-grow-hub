"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScoringEngine = void 0;
class ScoringEngine {
    static calculateScore(responses) {
        let totalWeight = 0;
        let totalScore = 0;
        const categoryScores = {};
        for (const response of responses) {
            const question = response.question;
            const weight = Number(question.weight);
            const categoryId = question.categoryId;
            const categoryName = question.category.name;
            // Initialize category score if not exists
            if (!categoryScores[categoryId]) {
                categoryScores[categoryId] = { name: categoryName, score: 0, maxScore: 0 };
            }
            // Calculate raw score based on question type
            const rawScore = this.calculateRawScore(response, question);
            // Normalize to 0-100
            // Assuming max raw score is 5 for scale, 1 for boolean/choice (mapped to value)
            const maxRawScore = this.getMaxRawScore(question);
            const normalizedScore = (rawScore / maxRawScore) * 100;
            // Weighted accumulation
            totalScore += normalizedScore * weight;
            totalWeight += weight;
            categoryScores[categoryId].score += normalizedScore * weight;
            categoryScores[categoryId].maxScore += 100 * weight;
        }
        const finalScore = totalWeight > 0 ? totalScore / totalWeight : 0;
        return {
            totalScore: finalScore,
            categoryScores
        };
    }
    static calculateRawScore(response, question) {
        const value = response.answerValue;
        if (question.type === 'scale') {
            // Scale is usually 1-5 direct number
            return typeof value === 'number' ? value : Number(value) || 0;
        }
        else if (question.type === 'boolean') {
            // Boolean: true = 1, false = 0 (or customized via options if needed)
            // Assuming simple yes/no where yes is "good" (1)
            return value === true || value === 'true' ? 1 : 0;
        }
        else if (question.type === 'multiple_choice') {
            // Multiple choice: value might be an object { value: 5, label: '...' } or just a value
            if (typeof value === 'object' && value !== null) {
                return value.value || 0;
            }
            return Number(value) || 0;
        }
        return 0;
    }
    static getMaxRawScore(question) {
        if (question.type === 'scale') {
            // Check if options has max value
            if (question.options) {
                const opts = question.options;
                if (opts.max)
                    return Number(opts.max);
            }
            return 5; // Default max for scale
        }
        if (question.type === 'boolean')
            return 1;
        if (question.type === 'multiple_choice') {
            if (question.options) {
                const opts = question.options;
                if (Array.isArray(opts)) {
                    // Find max value among options
                    // Assuming values are numbers or can be parsed
                    const values = opts.map(o => Number(o.value) || 0);
                    return Math.max(...values, 0) || 1; // Default to 1 if all 0
                }
            }
            return 1; // Default fallback
        }
        return 0;
    }
}
exports.ScoringEngine = ScoringEngine;
