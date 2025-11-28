import { ApiClient } from '../../infrastructure/api/ApiClient'
import { StorageService } from '../../infrastructure/storage/StorageService'
import { Assessment, AssessmentTemplate, AssessmentResponse, AssessmentScore, Recommendation } from '../types'
import { AssessmentEngine } from './AssessmentEngine'

type Ctor = { apiClient: ApiClient; assessmentEngine: AssessmentEngine; storageService: StorageService }

export class AssessmentService {
  private apiClient: ApiClient
  private engine: AssessmentEngine
  private storage: StorageService

  constructor({ apiClient, assessmentEngine, storageService }: Ctor) {
    this.apiClient = apiClient
    this.engine = assessmentEngine
    this.storage = storageService
  }

  async getTemplates(): Promise<AssessmentTemplate[]> {
    const res = await this.apiClient.get<AssessmentTemplate[]>('/assessment')
    return res.success && res.data ? res.data : []
  }

  async startAssessment(templateId: string): Promise<Assessment> {
    const res = await this.apiClient.post<Assessment>('/assessment', { templateId })
    if (res.success && res.data) return res.data
    throw new Error(res.error?.message || 'Failed to start assessment')
  }

  async submitResponse(assessmentId: string, response: AssessmentResponse): Promise<void> {
    await this.apiClient.post(`/assessment/${assessmentId}/responses`, response)
  }

  async finalize(assessmentId: string): Promise<{ assessment: Assessment; score: AssessmentScore; recommendations: Recommendation[] }> {
    const res = await this.apiClient.post<Assessment>(`/assessment/${assessmentId}/submit`)
    if (!res.success || !res.data) throw new Error(res.error?.message || 'Finalize failed')
    const assessment = res.data
    const templateRes = await this.apiClient.get<AssessmentTemplate>(`/assessment/templates/${assessment.category}`)
    const template = templateRes.success && templateRes.data ? templateRes.data : await this.getLocalTemplate(assessment.category)
    const score = this.engine.calculateScore(assessment, template)
    const recommendations = this.engine.generateRecommendations(assessment, score)
    return { assessment, score, recommendations }
  }

  async getHistory(userId: string): Promise<Assessment[]> {
    const res = await this.apiClient.get<Assessment[]>('/assessment/me')
    return res.success && res.data ? res.data : []
  }

  private async getLocalTemplate(category: AssessmentTemplate['category']): Promise<AssessmentTemplate> {
    const key = `assessment_template_${category}`
    const cached = await this.storage.getItem<AssessmentTemplate>(key)
    if (cached) return cached
    const fallback: AssessmentTemplate = {
      id: `local_${category}`,
      title: category,
      description: category,
      category,
      businessCategories: [],
      sections: [],
      scoringRules: [],
      recommendationRules: [],
      estimatedDuration: 15,
      version: '1.0.0',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    await this.storage.setItem(key, fallback)
    return fallback
  }
}
