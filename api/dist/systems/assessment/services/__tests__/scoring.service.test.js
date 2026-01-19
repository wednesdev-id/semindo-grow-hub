"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const scoring_service_1 = require("../scoring.service");
// Mock types since we can't easily import from @prisma/client in tests without full DB setup
// We just need objects that match the shape expected by ScoringEngine
const mockCategory = {
    id: 'cat1',
    name: 'Finance',
    description: 'Finance stuff',
    createdAt: new Date(),
    updatedAt: new Date()
};
(0, vitest_1.describe)('ScoringEngine', () => {
    (0, vitest_1.describe)('calculateScore', () => {
        (0, vitest_1.it)('should calculate score correctly for scale questions', () => {
            const responses = [
                {
                    id: 'r1',
                    answerValue: 5, // Max score
                    question: {
                        id: 'q1',
                        type: 'scale',
                        weight: 1,
                        categoryId: 'cat1',
                        category: mockCategory
                    }
                },
                {
                    id: 'r2',
                    answerValue: 3, // 60% score
                    question: {
                        id: 'q2',
                        type: 'scale',
                        weight: 1,
                        categoryId: 'cat1',
                        category: mockCategory
                    }
                }
            ];
            const result = scoring_service_1.ScoringEngine.calculateScore(responses);
            // q1: 5/5 = 100%
            // q2: 3/5 = 60%
            // Avg: 80%
            (0, vitest_1.expect)(result.totalScore).toBe(80);
            (0, vitest_1.expect)(result.categoryScores['cat1'].score).toBe(160); // 100 + 60
            (0, vitest_1.expect)(result.categoryScores['cat1'].maxScore).toBe(200); // 100 + 100
        });
        (0, vitest_1.it)('should handle weighted questions', () => {
            const responses = [
                {
                    id: 'r1',
                    answerValue: 5, // 100%
                    question: {
                        id: 'q1',
                        type: 'scale',
                        weight: 2, // Double weight
                        categoryId: 'cat1',
                        category: mockCategory
                    }
                },
                {
                    id: 'r2',
                    answerValue: 3, // 60%
                    question: {
                        id: 'q2',
                        type: 'scale',
                        weight: 1, // Normal weight
                        categoryId: 'cat1',
                        category: mockCategory
                    }
                }
            ];
            const result = scoring_service_1.ScoringEngine.calculateScore(responses);
            // q1: 100% * 2 = 200
            // q2: 60% * 1 = 60
            // Total weighted score: 260
            // Total weight: 3
            // Final: 260 / 3 = 86.66...
            (0, vitest_1.expect)(result.totalScore).toBeCloseTo(86.67, 2);
        });
        (0, vitest_1.it)('should handle boolean questions', () => {
            const responses = [
                {
                    id: 'r1',
                    answerValue: true, // 100%
                    question: {
                        id: 'q1',
                        type: 'boolean',
                        weight: 1,
                        categoryId: 'cat1',
                        category: mockCategory
                    }
                },
                {
                    id: 'r2',
                    answerValue: false, // 0%
                    question: {
                        id: 'q2',
                        type: 'boolean',
                        weight: 1,
                        categoryId: 'cat1',
                        category: mockCategory
                    }
                }
            ];
            const result = scoring_service_1.ScoringEngine.calculateScore(responses);
            // q1: 1/1 = 100%
            // q2: 0/1 = 0%
            // Avg: 50%
            (0, vitest_1.expect)(result.totalScore).toBe(50);
        });
        (0, vitest_1.it)('should handle multiple categories', () => {
            const mockCategory2 = { ...mockCategory, id: 'cat2', name: 'Marketing' };
            const responses = [
                {
                    id: 'r1',
                    answerValue: 5,
                    question: {
                        id: 'q1',
                        type: 'scale',
                        weight: 1,
                        categoryId: 'cat1',
                        category: mockCategory
                    }
                },
                {
                    id: 'r2',
                    answerValue: 5,
                    question: {
                        id: 'q2',
                        type: 'scale',
                        weight: 1,
                        categoryId: 'cat2',
                        category: mockCategory2
                    }
                }
            ];
            const result = scoring_service_1.ScoringEngine.calculateScore(responses);
            (0, vitest_1.expect)(result.totalScore).toBe(100);
            (0, vitest_1.expect)(result.categoryScores['cat1']).toBeDefined();
            (0, vitest_1.expect)(result.categoryScores['cat2']).toBeDefined();
        });
    });
});
