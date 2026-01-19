"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationService = void 0;
class ValidationService {
    static validateResponse(question, answer) {
        // 1. Check if required
        if (question.isRequired) {
            if (answer === null || answer === undefined || answer === '') {
                return {
                    questionId: question.id,
                    message: 'This question is required'
                };
            }
            if (Array.isArray(answer) && answer.length === 0) {
                return {
                    questionId: question.id,
                    message: 'This question is required'
                };
            }
        }
        // If not required and empty, it's valid
        if (answer === null || answer === undefined || answer === '') {
            return null;
        }
        // 2. Validate based on type
        switch (question.type) {
            case 'scale':
                return this.validateScale(question, answer);
            case 'multiple_choice':
                return this.validateMultipleChoice(question, answer);
            case 'boolean':
                return this.validateBoolean(question, answer);
            case 'text':
                return this.validateText(question, answer);
            default:
                return null;
        }
    }
    static validateScale(question, answer) {
        const val = Number(answer);
        if (isNaN(val)) {
            return { questionId: question.id, message: 'Value must be a number' };
        }
        // Assuming scale is 1-5 by default if not specified in options
        // In a real app, we'd parse question.options or question.scaleConfig
        const min = 1;
        const max = 5;
        if (val < min || val > max) {
            return { questionId: question.id, message: `Value must be between ${min} and ${max}` };
        }
        return null;
    }
    static validateMultipleChoice(question, answer) {
        // answer can be string, number, or array of them
        const options = question.options;
        if (!options)
            return null;
        const validValues = options.map(o => String(o.value));
        if (Array.isArray(answer)) {
            for (const a of answer) {
                if (!validValues.includes(String(a))) {
                    return { questionId: question.id, message: 'Invalid option selected' };
                }
            }
        }
        else {
            if (!validValues.includes(String(answer))) {
                return { questionId: question.id, message: 'Invalid option selected' };
            }
        }
        return null;
    }
    static validateBoolean(question, answer) {
        if (typeof answer !== 'boolean' && answer !== 'true' && answer !== 'false') {
            return { questionId: question.id, message: 'Value must be a boolean' };
        }
        return null;
    }
    static validateText(question, answer) {
        if (typeof answer !== 'string') {
            return { questionId: question.id, message: 'Value must be text' };
        }
        return null;
    }
}
exports.ValidationService = ValidationService;
