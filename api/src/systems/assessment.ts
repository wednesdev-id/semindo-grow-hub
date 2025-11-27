import { Router } from 'express'

type AssessmentStatus = 'draft' | 'completed'
type AssessmentCategory = 'General' | string

type AssessmentTemplate = {
  id: string
  title: string
  description: string
  category: AssessmentCategory
  businessCategories: string[]
  sections: Array<{ id: string; title: string; questions: any[] }>
  scoringRules: any[]
  recommendationRules: any[]
  estimatedDuration: number
  version: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

type Assessment = {
  id: string
  userId: string
  title: string
  category: AssessmentCategory
  status: AssessmentStatus
  currentSection: number
  totalSections: number
  responses: any[]
  score: any
  level: string
  recommendations: any[]
  startedAt: Date
  updatedAt: Date
}

export const assessmentRouter = Router()

assessmentRouter.get('/templates', (_req, res) => {
  const templates: AssessmentTemplate[] = [
    {
      id: 't-general',
      title: 'Self-Assessment UMKM',
      description: 'Template umum',
      category: 'General',
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
  ]
  res.json(templates)
})

assessmentRouter.get('/templates/:category', (req, res) => {
  const category = req.params.category as AssessmentCategory
  const template: AssessmentTemplate = {
    id: `t-${category}`,
    title: String(category),
    description: String(category),
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
  res.json(template)
})

assessmentRouter.post('/start', (req, res) => {
  const { templateId } = req.body as { templateId: string }
  const assessment: Assessment = {
    id: `a-${Date.now()}`,
    userId: 'u-demo',
    title: templateId,
    category: 'General',
    status: 'draft',
    currentSection: 0,
    totalSections: 0,
    responses: [],
    score: {},
    level: 'Mikro',
    recommendations: [],
    startedAt: new Date(),
    updatedAt: new Date()
  }
  res.json(assessment)
})

assessmentRouter.post('/:id/responses', (_req, res) => {
  res.status(204).end()
})

assessmentRouter.post('/:id/finalize', (req, res) => {
  const id = req.params.id
  const assessment: Assessment = {
    id,
    userId: 'u-demo',
    title: 'Self-Assessment UMKM',
    category: 'General',
    status: 'completed',
    currentSection: 0,
    totalSections: 0,
    responses: [],
    score: { total: 80 },
    level: 'Kecil',
    recommendations: [],
    startedAt: new Date(),
    updatedAt: new Date()
  }
  res.json(assessment)
})

assessmentRouter.get('/history', (req, res) => {
  const userId = String(req.query.userId || '')
  const items: Assessment[] = []
  res.json(items)
})
