export type AnswerValue = string | number | boolean | string[] | number[] | null;

export interface AssessmentQuestion {
    id: string;
    templateId: string;
    categoryId: string;
    text: string;
    type: 'multiple_choice' | 'scale' | 'boolean' | 'text';
    options?: any;
    weight: number;
    order: number;
    category: {
        id: string;
        name: string;
    };
}

export interface AssessmentResponse {
    id: string;
    assessmentId: string;
    questionId: string;
    answerValue: AnswerValue;
    createdAt: string;
}

export interface AssessmentTemplate {
    id: string;
    title: string;
    description: string;
    category: string;
    isActive: boolean;
    questions?: AssessmentQuestion[];
    _count?: {
        questions: number;
    };
}

export interface Assessment {
    id: string;
    userId: string;
    templateId: string;
    template?: AssessmentTemplate;
    status: 'draft' | 'in_progress' | 'completed';
    startedAt: string;
    completedAt?: string;
    createdAt: string;
    updatedAt: string;
    score?: AssessmentScore;
    responses?: AssessmentResponse[];
}

export type BusinessLevel = 'mikro' | 'kecil' | 'menengah';

export interface AssessmentScore {
    id: string;
    totalScore: number;
    umkmLevel: BusinessLevel;
    categoryScores: Record<string, { name: string, score: number, maxScore: number }>;
}

export interface Recommendation {
    id: string;
    assessment_id: string;
    title: string;
    description: string;
    priority: string;
    category: string;
    action_items: string[];
    resources: any[];
    estimated_time?: string;
    estimated_cost?: string;
}
