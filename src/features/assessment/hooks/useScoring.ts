import { useMemo } from 'react';
import { AnswerValue } from '../types';

export const useScoring = (
    responses: Record<string, AnswerValue>,
    questions: any[] = []
) => {
    const score = useMemo(() => {
        if (!questions.length) return 0;

        let totalScore = 0;
        let totalWeight = 0;

        questions.forEach(question => {
            const response = responses[question.id];
            if (response === undefined || response === null) return;

            const weight = Number(question.weight) || 1;
            let rawScore = 0;
            let maxRawScore = 0;

            // Calculate raw score based on type
            // This logic mirrors the backend ScoringEngine but simplified for frontend estimation
            switch (question.type) {
                case 'scale':
                    rawScore = Number(response) || 0;
                    maxRawScore = 5; // Default max for scale
                    if (question.options?.max) maxRawScore = Number(question.options.max);
                    break;
                case 'boolean':
                    rawScore = response === true ? 1 : 0;
                    maxRawScore = 1;
                    break;
                case 'multiple_choice':
                    // Assuming simple 1 point for answered, or value from options if available
                    // This is a simplification. Real logic might be more complex.
                    // For now, let's assume if it has a value, it's 1 (completed), else 0.
                    // Or if options have values, use them.
                    if (question.options && Array.isArray(question.options)) {
                        // Try to find selected option's value
                        const selectedOption = question.options.find((opt: any) => opt.value === response);
                        if (selectedOption && selectedOption.score) {
                            rawScore = Number(selectedOption.score);
                        } else {
                            rawScore = 1; // Default
                        }
                        // Find max possible score from options
                        const maxOptionScore = Math.max(...question.options.map((o: any) => Number(o.score) || 0), 1);
                        maxRawScore = maxOptionScore;
                    } else {
                        rawScore = 1;
                        maxRawScore = 1;
                    }
                    break;
                default:
                    rawScore = 0;
                    maxRawScore = 0;
            }

            if (maxRawScore > 0) {
                const normalizedScore = (rawScore / maxRawScore) * 100;
                totalScore += normalizedScore * weight;
                totalWeight += weight;
            }
        });

        return totalWeight > 0 ? Math.round(totalScore / totalWeight) : 0;
    }, [responses, questions]);

    return { score };
};
