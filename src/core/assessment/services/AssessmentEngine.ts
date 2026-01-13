/**
 * Assessment Engine Service - Core Business Logic
 * Handles assessment scoring, recommendations, and business rules
 */

import {
  Assessment,
  AssessmentTemplate,
  AssessmentResponse,
  AssessmentScore,
  CategoryScore,
  Recommendation,
  ScoringRule,
  RecommendationRule,
  AnswerValue,
  BusinessLevel,
  AssessmentCategory,
  ScoreBreakdown,
  SectionScore,
  QuestionScore,
  AssessmentQuestion,
  QuestionOption,
  AssessmentSection
} from '../types';

/**
 * Assessment Engine - Core business logic for scoring and recommendations
 */
export class AssessmentEngine {
  private scoringRules: ScoringRule[];
  private recommendationRules: RecommendationRule[];

  constructor(rules?: { scoringRules?: ScoringRule[]; recommendationRules?: RecommendationRule[] }) {
    this.scoringRules = rules?.scoringRules || this.getDefaultScoringRules();
    this.recommendationRules = rules?.recommendationRules || this.getDefaultRecommendationRules();
  }

  /**
   * Calculate assessment score based on responses
   */
  calculateScore(assessment: Assessment, template: AssessmentTemplate): AssessmentScore {
    try {
      // Calculate base scores by category
      const categoryScores = this.calculateCategoryScores(assessment, template);
      
      // Calculate total score
      const totalScore = categoryScores.reduce((sum: number, cat: CategoryScore) => sum + cat.score, 0);
      const maxPossibleScore = categoryScores.reduce((sum: number, cat: CategoryScore) => sum + cat.maxScore, 0);
      const percentage = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;

      // Determine business level based on score
      const level = this.determineBusinessLevel(percentage);

      // Calculate confidence score
      const confidence = this.calculateConfidenceScore(assessment, template);

      // Apply scoring rules
      const finalScore = this.applyScoringRules({
        totalScore,
        maxPossibleScore,
        percentage,
        categoryScores,
        level,
        confidence,
        breakdown: this.createScoreBreakdown(assessment, template, categoryScores)
      });

      return finalScore;
    } catch (error) {
      console.error('Error calculating assessment score:', error);
      throw new Error('Failed to calculate assessment score');
    }
  }

  /**
   * Calculate category-specific scores
   */
  private calculateCategoryScores(assessment: Assessment, template: AssessmentTemplate): CategoryScore[] {
    const categoryScores: Map<string, CategoryScore> = new Map();

    // Group responses by category
    const responsesByCategory = this.groupResponsesByCategory(assessment, template);

    // Calculate score for each category
    for (const [category, responses] of responsesByCategory) {
      const categoryScore = this.calculateCategoryScore(category, responses, template);
      categoryScores.set(category, categoryScore);
    }

    return Array.from(categoryScores.values()).sort((a, b) => a.category.localeCompare(b.category));
  }

  /**
   * Group responses by category
   */
  private groupResponsesByCategory(assessment: Assessment, template: AssessmentTemplate): Map<string, AssessmentResponse[]> {
    const groups = new Map<string, AssessmentResponse[]>();

    for (const response of assessment.responses) {
      const question = this.findQuestionById(response.questionId, template);
      if (question) {
        const category = question.category;
        if (!groups.has(category)) {
          groups.set(category, []);
        }
        groups.get(category)!.push(response);
      }
    }

    return groups;
  }

  /**
   * Calculate score for a specific category
   */
  private calculateCategoryScore(category: string, responses: AssessmentResponse[], template: AssessmentTemplate): CategoryScore {
    let totalScore = 0;
    let maxScore = 0;
    let totalWeight = 0;

    for (const response of responses) {
      const question = this.findQuestionById(response.questionId, template);
      if (question && response.isValid) {
        const questionScore = this.calculateQuestionScore(response, question);
        const weightedScore = questionScore * question.weight;
        const maxQuestionScore = this.getMaxQuestionScore(question) * question.weight;

        totalScore += weightedScore;
        maxScore += maxQuestionScore;
        totalWeight += question.weight;
      }
    }

    const percentage = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    const level = this.getScoreLevel(percentage);

    return {
      category,
      score: totalScore,
      maxScore,
      percentage,
      level,
      weight: totalWeight
    };
  }

  /**
   * Calculate score for individual question
   */
  private calculateQuestionScore(response: AssessmentResponse, question: AssessmentQuestion): number {
    const answer = response.answer;

    switch (question.type) {
      case 'multiple_choice':
        return this.calculateMultipleChoiceScore(answer, question);
      case 'scale':
        return this.calculateScaleScore(answer, question);
      case 'boolean':
        return this.calculateBooleanScore(answer, question);
      case 'text':
        return this.calculateTextScore(answer, question);
      default:
        return 0;
    }
  }

  /**
   * Calculate multiple choice question score
   */
  private calculateMultipleChoiceScore(answer: AnswerValue, question: AssessmentQuestion): number {
    if (Array.isArray(answer)) {
      // Multiple selection
      let score = 0;
      for (const selectedOption of answer as string[]) {
        const option = question.options?.find((opt: QuestionOption) => opt.value === selectedOption);
        if (option && option.score !== undefined) {
          score += option.score;
        }
      }
      return score;
    } else {
      // Single selection
      const option = question.options?.find((opt: QuestionOption) => opt.value === answer);
      return option?.score || 0;
    }
  }

  /**
   * Calculate scale question score
   */
  private calculateScaleScore(answer: AnswerValue, question: AssessmentQuestion): number {
    if (typeof answer === 'number' && question.scaleConfig) {
      // Normalize scale score to 0-100
      const { min, max } = question.scaleConfig;
      return ((answer - min) / (max - min)) * 100;
    }
    return 0;
  }

  /**
   * Calculate boolean question score
   */
  private calculateBooleanScore(answer: AnswerValue, question: AssessmentQuestion): number {
    if (typeof answer === 'boolean') {
      return answer ? 100 : 0;
    }
    return 0;
  }

  /**
   * Calculate text question score (basic implementation)
   */
  private calculateTextScore(answer: AnswerValue, question: AssessmentQuestion): number {
    if (typeof answer === 'string' && answer.trim().length > 0) {
      // Basic scoring: non-empty text gets full score
      // This can be enhanced with AI-based analysis
      return 100;
    }
    return 0;
  }

  /**
   * Get maximum possible score for a question
   */
  private getMaxQuestionScore(question: AssessmentQuestion): number {
    switch (question.type) {
      case 'multiple_choice':
        if (question.options) {
          const maxOptionScore = Math.max(...question.options.map((opt: QuestionOption) => opt.score || 0));
          return maxOptionScore;
        }
        return 100;
      case 'scale':
      case 'boolean':
      case 'text':
        return 100;
      default:
        return 100;
    }
  }

  /**
   * Determine business level based on overall score
   */
  private determineBusinessLevel(percentage: number): BusinessLevel {
    if (percentage >= 70) return 'medium';
    if (percentage >= 40) return 'small';
    return 'micro';
  }

  /**
   * Get score level (low/medium/high)
   */
  private getScoreLevel(percentage: number): 'low' | 'medium' | 'high' {
    if (percentage >= 70) return 'high';
    if (percentage >= 40) return 'medium';
    return 'low';
  }

  /**
   * Calculate confidence score based on completion and answer quality
   */
  private calculateConfidenceScore(assessment: Assessment, template: AssessmentTemplate): number {
    const totalQuestions = this.countTotalQuestions(template);
    const answeredQuestions = assessment.responses.filter((r: AssessmentResponse) => r.isValid).length;
    const completionRate = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0;

    // Consider time spent vs estimated time
    const estimatedTime = template.estimatedDuration * 60; // convert to seconds
    const timeRatio = estimatedTime > 0 ? assessment.timeSpent / estimatedTime : 1;
    const timeScore = Math.min(100, timeRatio * 100);

    // Combine factors
    const confidence = (completionRate * 0.7) + (timeScore * 0.3);
    return Math.round(Math.min(100, Math.max(0, confidence)));
  }

  /**
   * Count total questions in template
   */
  private countTotalQuestions(template: AssessmentTemplate): number {
    return template.sections.reduce((total: number, section: AssessmentSection) => total + section.questions.length, 0);
  }

  /**
   * Create detailed score breakdown
   */
  private createScoreBreakdown(assessment: Assessment, template: AssessmentTemplate, categoryScores: CategoryScore[]): ScoreBreakdown {
    const sectionScores = this.calculateSectionScores(assessment, template);
    const questionScores = this.calculateQuestionScores(assessment, template);

    return {
      bySection: sectionScores,
      byQuestion: questionScores,
      recommendations: this.generateScoreBasedRecommendationIds(categoryScores)
    };
  }

  /**
   * Generate recommendation IDs based on category scores
   */
  private generateScoreBasedRecommendationIds(categoryScores: CategoryScore[]): string[] {
    const recommendations = this.generateScoreBasedRecommendations(categoryScores);
    return recommendations.map((rec: Recommendation) => rec.id);
  }

  /**
   * Calculate section scores
   */
  private calculateSectionScores(assessment: Assessment, template: AssessmentTemplate): SectionScore[] {
    return template.sections.map((section: AssessmentSection) => {
      const sectionResponses = assessment.responses.filter((r: AssessmentResponse) => r.sectionId === section.id && r.isValid);
      const sectionScore = sectionResponses.reduce((sum: number, response: AssessmentResponse) => {
        const question = this.findQuestionById(response.questionId, template);
        return sum + (question ? this.calculateQuestionScore(response, question) : 0);
      }, 0);

      const maxSectionScore = section.questions.reduce((sum: number, question: AssessmentQuestion) => {
        return sum + this.getMaxQuestionScore(question);
      }, 0);

      const percentage = maxSectionScore > 0 ? (sectionScore / maxSectionScore) * 100 : 0;

      return {
        sectionId: section.id,
        title: section.title,
        score: sectionScore,
        maxScore: maxSectionScore,
        percentage,
        level: this.getScoreLevel(percentage)
      };
    });
  }

  /**
   * Calculate individual question scores
   */
  private calculateQuestionScores(assessment: Assessment, template: AssessmentTemplate): QuestionScore[] {
    return assessment.responses
      .filter((response: AssessmentResponse) => response.isValid)
      .map((response: AssessmentResponse) => {
        const question = this.findQuestionById(response.questionId, template);
        if (!question) return null;

        const score = this.calculateQuestionScore(response, question);
        const maxScore = this.getMaxQuestionScore(question);

        return {
          questionId: response.questionId,
          title: question.title,
          answer: response.answer,
          score,
          maxScore,
          weight: question.weight
        };
      })
      .filter((score): score is QuestionScore => score !== null);
  }

  /**
   * Apply scoring rules for adjustments
   */
  private applyScoringRules(baseScore: AssessmentScore): AssessmentScore {
    let adjustedScore = { ...baseScore };

    // Apply rules in priority order
    const sortedRules = [...this.scoringRules].sort((a, b) => a.priority - b.priority);

    for (const rule of sortedRules) {
      if (this.evaluateRuleCondition(rule.condition, adjustedScore)) {
        adjustedScore = this.applyScoreAdjustment(adjustedScore, rule);
      }
    }

    return adjustedScore;
  }

  /**
   * Evaluate rule condition
   */
  private evaluateRuleCondition(condition: string, score: AssessmentScore): boolean {
    try {
      // Simple condition evaluation (can be enhanced with proper expression parser)
      // Example: "percentage < 30" or "categoryScores['digital_readiness'].percentage < 50"
      
      // This is a simplified implementation
      if (condition.includes('percentage')) {
        const operator = condition.includes('<') ? '<' : condition.includes('>') ? '>' : '=';
        const value = parseFloat(condition.split(operator)[1].trim());
        const scoreValue = score.percentage;
        
        switch (operator) {
          case '<': return scoreValue < value;
          case '>': return scoreValue > value;
          case '=': return scoreValue === value;
        }
      }
      
      return false;
    } catch (error) {
      console.error('Error evaluating rule condition:', error);
      return false;
    }
  }

  /**
   * Apply score adjustment based on rule
   */
  private applyScoreAdjustment(score: AssessmentScore, rule: ScoringRule): AssessmentScore {
    const adjustedScore = { ...score };

    switch (rule.type) {
      case 'add':
        adjustedScore.totalScore += rule.scoreModifier;
        adjustedScore.percentage = (adjustedScore.totalScore / adjustedScore.maxPossibleScore) * 100;
        break;
      case 'multiply':
        adjustedScore.totalScore *= rule.scoreModifier;
        adjustedScore.percentage = (adjustedScore.totalScore / adjustedScore.maxPossibleScore) * 100;
        break;
      case 'set':
        adjustedScore.totalScore = rule.scoreModifier;
        adjustedScore.percentage = (adjustedScore.totalScore / adjustedScore.maxPossibleScore) * 100;
        break;
    }

    return adjustedScore;
  }

  /**
   * Generate recommendations based on assessment results
   */
  generateRecommendations(assessment: Assessment, score: AssessmentScore): Recommendation[] {
    const recommendations: Recommendation[] = [];

    // Apply recommendation rules
    for (const rule of this.recommendationRules) {
      if (this.evaluateRecommendationRule(rule, score)) {
        const ruleRecommendations = this.getRecommendationsByIds(rule.recommendations);
        recommendations.push(...ruleRecommendations);
      }
    }

    // Add score-based recommendations
    const scoreRecommendations = this.generateScoreBasedRecommendations(score.categoryScores);
    recommendations.push(...scoreRecommendations);

    // Remove duplicates and sort by priority
    const uniqueRecommendations = this.removeDuplicateRecommendations(recommendations);
    return uniqueRecommendations.sort((a, b) => this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority));
  }

  /**
   * Evaluate recommendation rule
   */
  private evaluateRecommendationRule(rule: RecommendationRule, score: AssessmentScore): boolean {
    // Similar to scoring rule evaluation, but for recommendations
    // This can be enhanced with more sophisticated logic
    return this.evaluateRuleCondition(rule.condition, score);
  }

  /**
   * Generate recommendations based on category scores
   */
  private generateScoreBasedRecommendations(categoryScores: CategoryScore[]): Recommendation[] {
    const recommendations: Recommendation[] = [];

    for (const categoryScore of categoryScores) {
      if (categoryScore.percentage < 50) {
        // Low score recommendations
        const lowScoreRecs = this.getLowScoreRecommendations(categoryScore.category);
        recommendations.push(...lowScoreRecs);
      } else if (categoryScore.percentage < 70) {
        // Medium score recommendations
        const mediumScoreRecs = this.getMediumScoreRecommendations(categoryScore.category);
        recommendations.push(...mediumScoreRecs);
      }
    }

    return recommendations;
  }

  /**
   * Utility methods for finding questions and recommendations
   */
  private findQuestionById(questionId: string, template: AssessmentTemplate): AssessmentQuestion | null {
    for (const section of template.sections as AssessmentSection[]) {
      const question = section.questions.find(q => q.id === questionId);
      if (question) return question;
    }
    return null;
  }

  private getRecommendationsByIds(ids: string[]): Recommendation[] {
    // This would fetch recommendations from a repository
    // For now, return empty array
    return [];
  }

  private getLowScoreRecommendations(category: string): Recommendation[] {
    // Return predefined recommendations for low scores in category
    return [];
  }

  private getMediumScoreRecommendations(category: string): Recommendation[] {
    // Return predefined recommendations for medium scores in category
    return [];
  }

  private removeDuplicateRecommendations(recommendations: Recommendation[]): Recommendation[] {
    const seen = new Set<string>();
    return recommendations.filter((rec: Recommendation) => {
      if (seen.has(rec.id)) {
        return false;
      }
      seen.add(rec.id);
      return true;
    });
  }

  private getPriorityValue(priority: 'low' | 'medium' | 'high' | 'critical'): number {
    const values = { low: 1, medium: 2, high: 3, critical: 4 };
    return values[priority];
  }

  /**
   * Default scoring rules
   */
  private getDefaultScoringRules(): ScoringRule[] {
    return [
      {
        id: 'low_overall_score',
        category: 'overall',
        condition: 'percentage < 30',
        scoreModifier: 5,
        type: 'add',
        priority: 1
      },
      {
        id: 'high_digital_score',
        category: 'digital_readiness',
        condition: 'categoryScores[\'digital_readiness\'].percentage > 80',
        scoreModifier: 1.1,
        type: 'multiply',
        priority: 2
      }
    ];
  }

  /**
   * Default recommendation rules
   */
  private getDefaultRecommendationRules(): RecommendationRule[] {
    return [
      {
        id: 'critical_overall_score',
        category: 'overall',
        condition: 'percentage < 25',
        recommendations: ['urgent_consultation', 'basic_training'],
        priority: 1
      },
      {
        id: 'digital_readiness_low',
        category: 'digital_readiness',
        condition: 'categoryScores[\'digital_readiness\'].percentage < 40',
        recommendations: ['digital_training', 'technology_consultation'],
        priority: 2
      }
    ];
  }
}
