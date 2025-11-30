import { Request, Response } from 'express';
import { AssessmentService } from '../services/assessment.service';
import { RecommendationService } from '../services/recommendation.service';

const assessmentService = new AssessmentService()

export class AssessmentController {
    async create(req: Request, res: Response) {
        try {
            const userId = (req as any).user.userId
            const { templateId } = req.body
            const assessment = await assessmentService.createAssessment(userId, templateId)
            res.status(201).json({ data: assessment })
        } catch (error: any) {
            res.status(400).json({ error: error.message })
        }
    }

    async getOne(req: Request, res: Response) {
        try {
            const userId = (req as any).user.userId
            const { id } = req.params
            const assessment = await assessmentService.getAssessment(id, userId)
            if (!assessment) return res.status(404).json({ error: 'Assessment not found' })
            res.json({ data: assessment })
        } catch (error: any) {
            res.status(400).json({ error: error.message })
        }
    }

    async getMyAssessments(req: Request, res: Response) {
        try {
            const userId = (req as any).user.userId
            const assessments = await assessmentService.getUserAssessments(userId)
            res.json({ data: assessments })
        } catch (error: any) {
            res.status(400).json({ error: error.message })
        }
    }

    async saveResponse(req: Request, res: Response) {
        try {
            const userId = (req as any).user.userId
            const { id } = req.params
            const { questionId, answerValue } = req.body

            const response = await assessmentService.saveResponse(id, userId, questionId, answerValue)
            res.json({ data: response })
        } catch (error: any) {
            res.status(400).json({ error: error.message })
        }
    }

    async submit(req: Request, res: Response) {
        try {
            const userId = (req as any).user.userId
            const { id } = req.params

            const result = await assessmentService.submitAssessment(id, userId)
            res.json({ data: result })
        } catch (error: any) {
            res.status(400).json({ error: error.message })
        }
    }
}
