import { Request, Response } from 'express';
import { AssessmentService } from '../services/assessment.service';
import { RecommendationService } from '../services/recommendation.service';
import { PdfService } from '../services/pdf.service';

const assessmentService = new AssessmentService()
const pdfService = new PdfService()

export class AssessmentController {
    async getTemplates(req: Request, res: Response) {
        try {
            const { category } = req.query;
            if (category) {
                const templates = await assessmentService.getTemplatesByCategory(String(category));
                return res.json({ data: templates });
            }
            const templates = await assessmentService.getTemplates()
            res.json({ data: templates })
        } catch (error: any) {
            res.status(400).json({ error: error.message })
        }
    }

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

    async downloadPdf(req: Request, res: Response) {
        try {
            const userId = (req as any).user.userId;
            const { id } = req.params;

            // Get full assessment data
            const assessment = await assessmentService.getAssessment(id, userId);
            if (!assessment) return res.status(404).json({ error: 'Assessment not found' });

            // Generate PDF
            const pdfBuffer = await pdfService.generateAssessmentReport({
                assessment: assessment as any // Type assertion needed due to complex Prisma include
            });

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=assessment-${id}.pdf`);
            res.send(pdfBuffer);
        } catch (error: any) {
            console.error('PDF Generation Error:', error);
            res.status(500).json({ error: 'Failed to generate PDF report' });
        }
    }

    async previewPdf(req: Request, res: Response) {
        try {
            const userId = (req as any).user.userId;
            const { id } = req.params;

            // Get full assessment data
            const assessment = await assessmentService.getAssessment(id, userId);
            if (!assessment) return res.status(404).json({ error: 'Assessment not found' });

            // Generate PDF
            const pdfBuffer = await pdfService.generateAssessmentReport({
                assessment: assessment as any // Type assertion needed due to complex Prisma include
            });

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename=assessment-${id}.pdf`);
            res.send(pdfBuffer);
        } catch (error: any) {
            console.error('PDF Preview Error:', error);
            res.status(500).json({ error: 'Failed to generate PDF preview' });
        }
    }
}
