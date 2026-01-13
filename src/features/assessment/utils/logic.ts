import { AnswerValue } from '../types';

export const checkCondition = (question: any, allResponses: Record<string, AnswerValue>) => {
    if (!question.options || !question.options.condition) return true;

    const { questionId, operator, value } = question.options.condition;
    const dependentAnswer = allResponses[questionId];

    if (dependentAnswer === undefined) return false;

    switch (operator) {
        case 'equals': return dependentAnswer === value;
        case 'not_equals': return dependentAnswer !== value;
        case 'greater_than': return Number(dependentAnswer) > Number(value);
        case 'less_than': return Number(dependentAnswer) < Number(value);
        case 'contains': return Array.isArray(dependentAnswer) && (dependentAnswer as string[]).includes(value);
        default: return true;
    }
};
