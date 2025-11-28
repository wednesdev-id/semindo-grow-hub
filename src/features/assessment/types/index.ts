// Assessment Module Types
export type BusinessCategory = 'kuliner' | 'fashion' | 'kerajinan' | 'teknologi' | 'jasa'
export type AssessmentStatus = 'draft' | 'in_progress' | 'completed' | 'expired'
export type BusinessLevel = 'mikro' | 'kecil' | 'menengah'
export type QuestionType = 'multiple_choice' | 'scale' | 'boolean' | 'text'

export interface Assessment {
    id: string
    user_id: string
    template_id: string
    title: string
    category: BusinessCategory
    status: AssessmentStatus
    current_section: number
    total_sections: number
    started_at: Date
    completed_at?: Date
    expires_at?: Date
    time_spent: number // in seconds
    created_at: Date
    updated_at: Date
}

export interface AssessmentTemplate {
    id: string
    title: string
    description: string
    category: BusinessCategory
    sections: AssessmentSection[]
    estimated_duration: number // in minutes
    version: string
    is_active: boolean
    created_at: Date
}

export interface AssessmentSection {
    id: string
    template_id: string
    title: string
    description?: string
    order: number
    questions: AssessmentQuestion[]
}

export interface AssessmentQuestion {
    id: string
    section_id: string
    title: string
    description?: string
    type: QuestionType
    options?: QuestionOption[]
    scale_config?: ScaleConfig
    weight: number // for scoring (0.5 - 2.0)
    category: string // sub-category: Digital Presence, Operational Efficiency, etc
    is_required: boolean
    order: number
    help_text?: string
}

export interface QuestionOption {
    id: string
    label: string
    value: string | number
    score: number // 0-100
}

export interface ScaleConfig {
    min: number
    max: number
    min_label?: string
    max_label?: string
    step?: number
}

export interface AssessmentResponse {
    id: string
    assessment_id: string
    question_id: string
    section_id: string
    answer: AnswerValue
    time_spent: number // in seconds
    answered_at: Date
}

export type AnswerValue = string | number | boolean | string[]

export interface AssessmentScore {
    id: string
    assessment_id: string
    total_score: number // 0-100
    category_scores: CategoryScore[]
    umkm_level: BusinessLevel
    confidence_score: number
    calculated_at: Date
}

export interface CategoryScore {
    category: string
    score: number // 0-100
    weight: number
    questions_count: number
}

export interface Recommendation {
    id: string
    assessment_id: string
    title: string
    description: string
    priority: 'high' | 'medium' | 'low'
    category: string
    action_items: string[]
    resources?: Resource[]
    estimated_time?: string
    estimated_cost?: string
}

export interface Resource {
    title: string
    type: 'article' | 'video' | 'course' | 'tool'
    url: string
}

export interface AssessmentResults {
    assessment: Assessment
    score: AssessmentScore
    recommendations: Recommendation[]
    problem_mapping: ProblemMapping[]
}

export interface ProblemMapping {
    category: string
    problem: string
    severity: 'low' | 'medium' | 'high'
    score: number
    impact: string
}
