
import { Assessment, AssessmentScore, AssessmentResponse } from '@prisma/client';

export interface IdentifiedProblem {
    id: string;
    title: string;
    description: string;
    severity: 'low' | 'medium' | 'high' | 'critical';
    category: string;
    source: 'score' | 'response';
}

export class ProblemMappingService {
    static identifyProblems(assessment: Assessment, score: AssessmentScore, responses: AssessmentResponse[]): IdentifiedProblem[] {
        const problems: IdentifiedProblem[] = [];

        // 1. Identify problems based on Category Scores
        const categoryScores = score.categoryScores as Record<string, { name: string, score: number, maxScore: number }>;

        if (categoryScores) {
            for (const [categoryId, data] of Object.entries(categoryScores)) {
                const percentage = data.maxScore > 0 ? (data.score / data.maxScore) * 100 : 0;

                if (percentage < 40) {
                    problems.push({
                        id: `prob_cat_${categoryId}_critical`,
                        title: `Critical Weakness in ${data.name}`,
                        description: `Your score in ${data.name} is very low (${percentage.toFixed(0)}%). This indicates significant gaps in this area.`,
                        severity: 'critical',
                        category: data.name,
                        source: 'score'
                    });
                } else if (percentage < 60) {
                    problems.push({
                        id: `prob_cat_${categoryId}_high`,
                        title: `Weakness in ${data.name}`,
                        description: `Your score in ${data.name} is below average (${percentage.toFixed(0)}%). Improvement is needed.`,
                        severity: 'high',
                        category: data.name,
                        source: 'score'
                    });
                }
            }
        }

        // 2. Identify problems based on Specific Responses (Example logic)
        // In a real system, this would come from a database of "Problem Rules" similar to Recommendation Rules
        // For now, we'll hardcode some common patterns or leave it extensible

        // Example: If we had access to question text/options, we could check for specific "No" answers
        // Since we only have raw responses here, we'd need to look up the questions.
        // For MVP, we will rely primarily on score-based problems.

        return problems;
    }
}
