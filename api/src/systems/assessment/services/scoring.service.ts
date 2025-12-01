
import { AssessmentResponse, AssessmentQuestion, AssessmentCategory } from '@prisma/client';

type ResponseWithQuestion = AssessmentResponse & {
    question: AssessmentQuestion & {
        category: AssessmentCategory
    }
};

export interface ScoringResult {
    totalScore: number;
    categoryScores: Record<string, { name: string, score: number, maxScore: number }>;
}

export class ScoringEngine {
    static calculateScore(responses: ResponseWithQuestion[]): ScoringResult {
        let totalWeight = 0;
        let totalScore = 0;
        const categoryScores: Record<string, { name: string, score: number, maxScore: number }> = {};

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

    private static calculateRawScore(response: AssessmentResponse, question: AssessmentQuestion): number {
        const value = response.answerValue;

        if (question.type === 'scale') {
            // Scale is usually 1-5 direct number
            return typeof value === 'number' ? value : Number(value) || 0;
        } else if (question.type === 'boolean') {
            // Boolean: true = 1, false = 0 (or customized via options if needed)
            // Assuming simple yes/no where yes is "good" (1)
            return value === true || value === 'true' ? 1 : 0;
        } else if (question.type === 'multiple_choice') {
            // Multiple choice: value might be an object { value: 5, label: '...' } or just a value
            if (typeof value === 'object' && value !== null) {
                return (value as any).value || 0;
            }
            return Number(value) || 0;
        }

        return 0;
    }

    private static getMaxRawScore(question: AssessmentQuestion): number {
        if (question.type === 'scale') {
            return 5; // Default max for scale
        }
        // For boolean and multiple choice, we assume the value itself is the score (e.g. 0 or 1, or 0-5 mapped)
        // If multiple choice values are 0-5, max is 5. If 0-1, max is 1.
        // For now, let's assume standard normalization where "best" answer is 5 or 1.
        // To be safe and consistent with previous logic, let's assume max is 5 for everything if we want 0-100 scale
        // BUT, if boolean returns 1, and max is 5, then max score is 20%. That might be wrong.

        // Refined logic:
        // If boolean, max is 1.
        // If scale, max is 5.
        // If multiple choice, we need to know the max possible value from options.
        // For MVP, let's assume the 'value' stored in answer is already 0-5 scale equivalent.

        if (question.type === 'boolean') return 1;

        return 5; // Default fallback
    }
}
