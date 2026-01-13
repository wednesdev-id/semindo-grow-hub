/**
 * Assessment Module - Type Definitions
 * Core types for self-assessment engine
 */

import { BusinessCategory, BusinessLevel } from '../auth/types';

// Re-export BusinessLevel for use within assessment module
export type { BusinessLevel } from '../auth/types';

// Assessment Status
export type AssessmentStatus = 'draft' | 'in_progress' | 'completed' | 'expired' | 'archived';
export type QuestionType = 'multiple_choice' | 'scale' | 'boolean' | 'text' | 'file_upload';
export type AssessmentCategory = 'digital_readiness' | 'business_maturity' | 'financial_health' | 'operational_efficiency' | 'market_potential';

// Core Assessment Interfaces
export interface Assessment {
  id: string;
  userId: string;
  title: string;
  category: AssessmentCategory;
  businessCategory: BusinessCategory;
  status: AssessmentStatus;
  currentSection: number;
  totalSections: number;
  responses: AssessmentResponse[];
  score: AssessmentScore;
  level: BusinessLevel;
  recommendations: Recommendation[];
  pdfReportUrl?: string;
  startedAt: Date;
  completedAt?: Date;
  expiresAt?: Date;
  timeSpent: number; // in seconds
  metadata?: AssessmentMetadata;
  createdAt: Date;
  updatedAt: Date;
}

// Assessment Template
export interface AssessmentTemplate {
  id: string;
  title: string;
  description: string;
  category: AssessmentCategory;
  businessCategories: BusinessCategory[];
  sections: AssessmentSection[];
  scoringRules: ScoringRule[];
  recommendationRules: RecommendationRule[];
  estimatedDuration: number; // in minutes
  version: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Assessment Section
export interface AssessmentSection {
  id: string;
  title: string;
  description: string;
  order: number;
  questions: AssessmentQuestion[];
  isRequired: boolean;
  completionCriteria: CompletionCriteria;
}

// Assessment Question
export interface AssessmentQuestion {
  id: string;
  sectionId: string;
  title: string;
  description?: string;
  type: QuestionType;
  options?: QuestionOption[];
  scaleConfig?: ScaleConfig;
  validation?: QuestionValidation;
  weight: number; // for scoring
  category: string; // sub-category for scoring
  isRequired: boolean;
  order: number;
  conditionalLogic?: ConditionalLogic[];
  helpText?: string;
  exampleAnswer?: string;
  maxFileSize?: number; // for file upload questions
  allowedFileTypes?: string[]; // for file upload questions
}

// Question Options for multiple choice
export interface QuestionOption {
  id: string;
  text: string;
  value: string | number;
  score?: number; // specific score for this option
  followUpQuestions?: string[]; // conditional questions
  isExclusive?: boolean; // if true, deselects other options
}

// Scale Configuration
export interface ScaleConfig {
  min: number;
  max: number;
  step: number;
  labels?: {
    min: string;
    max: string;
    middle?: string;
  };
  showNumericValue: boolean;
}

// Question Validation
export interface QuestionValidation {
  minLength?: number;
  maxLength?: number;
  pattern?: string; // regex pattern
  minValue?: number;
  maxValue?: number;
  customMessage?: string;
}

// Conditional Logic
export interface ConditionalLogic {
  condition: string; // simple expression
  action: 'show' | 'hide' | 'require' | 'skip';
  targetQuestionId?: string;
  targetSectionId?: string;
}

// Completion Criteria
export interface CompletionCriteria {
  minQuestionsAnswered: number;
  requiredQuestions: string[];
  maxUnansweredQuestions: number;
}

// Assessment Response
export interface AssessmentResponse {
  id: string;
  questionId: string;
  sectionId: string;
  answer: AnswerValue;
  fileData?: FileResponseData; // for file upload questions
  timeSpent: number; // in seconds
  answeredAt: Date;
  isValid: boolean;
  validationErrors?: string[];
}

// Answer Value Types
export type AnswerValue = 
  | string 
  | number 
  | boolean 
  | string[] 
  | number[] 
  | FileUploadAnswer
  | null;

// File Upload Answer
export interface FileUploadAnswer {
  fileName: string;
  fileSize: number;
  fileType: string;
  fileUrl?: string;
  uploadedAt: Date;
}

// File Response Data
export interface FileResponseData {
  fileUrl: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadedAt: Date;
}

// Assessment Score
export interface AssessmentScore {
  totalScore: number;
  maxPossibleScore: number;
  percentage: number;
  categoryScores: CategoryScore[];
  level: BusinessLevel;
  confidence: number; // 0-100
  breakdown: ScoreBreakdown;
}

// Category Score
export interface CategoryScore {
  category: string;
  score: number;
  maxScore: number;
  percentage: number;
  level: 'low' | 'medium' | 'high';
  weight: number;
}

// Score Breakdown
export interface ScoreBreakdown {
  bySection: SectionScore[];
  byQuestion: QuestionScore[];
  recommendations: string[];
}

// Section Score
export interface SectionScore {
  sectionId: string;
  title: string;
  score: number;
  maxScore: number;
  percentage: number;
  level: 'low' | 'medium' | 'high';
}

// Question Score
export interface QuestionScore {
  questionId: string;
  title: string;
  answer: AnswerValue;
  score: number;
  maxScore: number;
  weight: number;
}

// Scoring Rule
export interface ScoringRule {
  id: string;
  category: string;
  condition: string; // expression
  scoreModifier: number;
  type: 'add' | 'multiply' | 'set';
  priority: number;
}

// Recommendation
export interface Recommendation {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  type: 'learning' | 'consultation' | 'financing' | 'tool' | 'action';
  actionItems: ActionItem[];
  resources: Resource[];
  estimatedImpact: string;
  timeFrame: string;
  costIndication: 'free' | 'low' | 'medium' | 'high';
  tags: string[];
}

// Action Item
export interface ActionItem {
  id: string;
  title: string;
  description: string;
  isCompleted: boolean;
  dueDate?: Date;
  assignedTo?: string;
  priority: 'low' | 'medium' | 'high';
}

// Resource
export interface Resource {
  id: string;
  title: string;
  type: 'article' | 'video' | 'course' | 'tool' | 'template' | 'checklist';
  url: string;
  description: string;
  duration?: number; // in minutes
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  isFree: boolean;
}

// Recommendation Rule
export interface RecommendationRule {
  id: string;
  category: string;
  condition: string; // expression based on scores
  recommendations: string[]; // recommendation IDs
  priority: number;
}

// Assessment Metadata
export interface AssessmentMetadata {
  deviceInfo?: DeviceInfo;
  location?: LocationInfo;
  referrer?: string;
  utmParameters?: UtmParameters;
  customFields?: Record<string, unknown>;
}

// Device Info
export interface DeviceInfo {
  deviceType: 'mobile' | 'tablet' | 'desktop';
  os: string;
  browser: string;
  screenResolution: string;
  viewportSize: string;
}

// Location Info
export interface LocationInfo {
  ipAddress: string;
  country: string;
  region: string;
  city: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// UTM Parameters
export interface UtmParameters {
  source?: string;
  medium?: string;
  campaign?: string;
  term?: string;
  content?: string;
}

// Assessment Progress
export interface AssessmentProgress {
  assessmentId: string;
  currentSection: number;
  totalSections: number;
  completedSections: number[];
  answeredQuestions: number;
  totalQuestions: number;
  percentageComplete: number;
  estimatedTimeRemaining: number; // in minutes
  canProceed: boolean;
  validationErrors: ValidationError[];
}

// Validation Error
export interface ValidationError {
  questionId: string;
  sectionId: string;
  message: string;
  type: 'required' | 'validation' | 'conditional';
}

// Assessment History
export interface AssessmentHistory {
  assessments: Assessment[];
  totalCount: number;
  averageScore: number;
  improvementTrend: 'improving' | 'declining' | 'stable';
  lastAssessmentDate?: Date;
}

// Assessment Comparison
export interface AssessmentComparison {
  currentAssessment: Assessment;
  previousAssessment?: Assessment;
  scoreComparison: {
    currentScore: number;
    previousScore?: number;
    change?: number;
    changePercentage?: number;
  };
  categoryComparisons: CategoryComparison[];
  recommendationChanges: RecommendationChange[];
}

// Category Comparison
export interface CategoryComparison {
  category: string;
  currentScore: number;
  previousScore?: number;
  change?: number;
  changePercentage?: number;
  trend: 'improved' | 'declined' | 'same';
}

// Recommendation Change
export interface RecommendationChange {
  recommendationId: string;
  type: 'new' | 'removed' | 'updated' | 'completed';
  previousStatus?: string;
  currentStatus?: string;
}

// Assessment Export
export interface AssessmentExport {
  assessmentId: string;
  format: 'pdf' | 'excel' | 'json';
  includeRecommendations: boolean;
  includeHistory: boolean;
  includeComparison: boolean;
  language: 'id' | 'en';
  generatedAt: Date;
  downloadUrl?: string;
}

// Assessment Settings
export interface AssessmentSettings {
  autoSaveInterval: number; // in seconds
  maxIdleTime: number; // in minutes
  allowResume: boolean;
  requireValidation: boolean;
  showProgress: boolean;
  showTimer: boolean;
  allowBackNavigation: boolean;
  shuffleQuestions: boolean;
  passingScore: number; // percentage
}
