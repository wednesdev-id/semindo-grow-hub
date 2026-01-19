"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssessmentService = void 0;
const db_1 = require("../../utils/db");
const recommendation_service_1 = require("./recommendation.service");
const scoring_service_1 = require("./scoring.service");
const level_service_1 = require("./level.service");
const template_service_1 = require("./template.service");
const validation_service_1 = require("./validation.service");
const problem_service_1 = require("./problem.service");
class AssessmentService {
    async getTemplates() {
        return template_service_1.TemplateService.getTemplates();
    }
    async getTemplatesByCategory(category) {
        return template_service_1.TemplateService.getTemplatesByCategory(category);
    }
    async createAssessment(userId, templateId) {
        // If no template provided, use the default active one
        let targetTemplateId = templateId;
        if (!targetTemplateId) {
            const defaultTemplate = await template_service_1.TemplateService.getDefaultTemplate();
            if (defaultTemplate) {
                targetTemplateId = defaultTemplate.id;
            }
        }
        return db_1.db.assessment.create({
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
        });
    }
    async getAssessment(id, userId) {
        const assessment = await db_1.db.assessment.findUnique({
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
        });
        if (!assessment)
            return null;
        if (assessment.userId !== userId)
            throw new Error('Unauthorized');
        return assessment;
    }
    async getUserAssessments(userId) {
        return db_1.db.assessment.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' },
            include: {
                score: true,
                template: true
            }
        });
    }
    async saveResponse(assessmentId, userId, questionId, answerValue) {
        const assessment = await db_1.db.assessment.findUnique({
            where: { id: assessmentId }
        });
        if (!assessment)
            throw new Error('Assessment not found');
        if (assessment.userId !== userId)
            throw new Error('Unauthorized');
        if (assessment.status === 'completed')
            throw new Error('Assessment already completed');
        // Validate Response
        const question = await db_1.db.assessmentQuestion.findUnique({ where: { id: questionId } });
        if (!question)
            throw new Error('Question not found');
        const validationError = validation_service_1.ValidationService.validateResponse(question, answerValue);
        if (validationError) {
            throw new Error(`Validation failed: ${validationError.message}`);
        }
        return db_1.db.assessmentResponse.upsert({
            where: {
                assessmentId_questionId: {
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
        });
    }
    async submitAssessment(id, userId) {
        const assessment = await db_1.db.assessment.findUnique({
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
        });
        if (!assessment)
            throw new Error('Assessment not found');
        if (assessment.userId !== userId)
            throw new Error('Unauthorized');
        // Calculate Score using ScoringEngine
        // Cast responses to the expected type as Prisma types can be slightly different
        const { totalScore, categoryScores } = scoring_service_1.ScoringEngine.calculateScore(assessment.responses);
        // Determine Level using LevelDeterminationService
        const umkmLevel = level_service_1.LevelDeterminationService.determineLevel(totalScore);
        // Identify Problems
        // We need a temporary score object to pass to ProblemMappingService
        const tempScore = {
            totalScore,
            categoryScores,
            umkmLevel
        };
        const problems = problem_service_1.ProblemMappingService.identifyProblems(assessment, tempScore, assessment.responses);
        // Save Score
        // Check if score already exists (e.g. re-submit)
        const existingScore = await db_1.db.assessmentScore.findUnique({ where: { assessmentId: id } });
        let savedScore;
        if (existingScore) {
            savedScore = await db_1.db.assessmentScore.update({
                where: { assessmentId: id },
                data: {
                    totalScore,
                    umkmLevel,
                    categoryScores: categoryScores,
                    calculatedAt: new Date()
                }
            });
        }
        else {
            savedScore = await db_1.db.assessmentScore.create({
                data: {
                    assessmentId: id,
                    totalScore,
                    umkmLevel,
                    confidenceScore: 0.9,
                    categoryScores: categoryScores
                }
            });
        }
        // Update Assessment Status
        await db_1.db.assessment.update({
            where: { id },
            data: {
                status: 'completed',
                completedAt: new Date()
            }
        });
        // Generate Recommendations
        // First delete existing recommendations if any (for re-submit)
        await db_1.db.assessmentRecommendation.deleteMany({ where: { assessmentId: id } });
        // Pass problems to recommendation service if needed, or let it generate based on score
        // For now, we'll stick to the existing rule-based generation but we could enhance it to use the identified problems
        await recommendation_service_1.RecommendationService.generateRecommendations(id, savedScore);
        return this.getAssessment(id, userId);
    }
}
exports.AssessmentService = AssessmentService;
