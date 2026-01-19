"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssessmentController = void 0;
const assessment_service_1 = require("../services/assessment.service");
const pdf_service_1 = require("../services/pdf.service");
const assessmentService = new assessment_service_1.AssessmentService();
const pdfService = new pdf_service_1.PdfService();
class AssessmentController {
    async getTemplates(req, res) {
        try {
            const { category } = req.query;
            if (category) {
                const templates = await assessmentService.getTemplatesByCategory(String(category));
                return res.json({ data: templates });
            }
            const templates = await assessmentService.getTemplates();
            res.json({ data: templates });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async create(req, res) {
        try {
            const userId = req.user.userId;
            const { templateId } = req.body;
            const assessment = await assessmentService.createAssessment(userId, templateId);
            res.status(201).json({ data: assessment });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getOne(req, res) {
        try {
            const userId = req.user.userId;
            const { id } = req.params;
            const assessment = await assessmentService.getAssessment(id, userId);
            if (!assessment)
                return res.status(404).json({ error: 'Assessment not found' });
            res.json({ data: assessment });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getMyAssessments(req, res) {
        try {
            const userId = req.user.userId;
            const assessments = await assessmentService.getUserAssessments(userId);
            res.json({ data: assessments });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async saveResponse(req, res) {
        try {
            const userId = req.user.userId;
            const { id } = req.params;
            const { questionId, answerValue } = req.body;
            const response = await assessmentService.saveResponse(id, userId, questionId, answerValue);
            res.json({ data: response });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async submit(req, res) {
        try {
            const userId = req.user.userId;
            const { id } = req.params;
            const result = await assessmentService.submitAssessment(id, userId);
            res.json({ data: result });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async downloadPdf(req, res) {
        try {
            const userId = req.user.userId;
            const { id } = req.params;
            // Get full assessment data
            const assessment = await assessmentService.getAssessment(id, userId);
            if (!assessment)
                return res.status(404).json({ error: 'Assessment not found' });
            // Generate PDF
            const pdfBuffer = await pdfService.generateAssessmentReport({
                assessment: assessment // Type assertion needed due to complex Prisma include
            });
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename=assessment-${id}.pdf`);
            res.send(pdfBuffer);
        }
        catch (error) {
            console.error('PDF Generation Error:', error);
            res.status(500).json({ error: 'Failed to generate PDF report' });
        }
    }
    async previewPdf(req, res) {
        try {
            const userId = req.user.userId;
            const { id } = req.params;
            // Get full assessment data
            const assessment = await assessmentService.getAssessment(id, userId);
            if (!assessment)
                return res.status(404).json({ error: 'Assessment not found' });
            // Generate PDF
            const pdfBuffer = await pdfService.generateAssessmentReport({
                assessment: assessment // Type assertion needed due to complex Prisma include
            });
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename=assessment-${id}.pdf`);
            res.send(pdfBuffer);
        }
        catch (error) {
            console.error('PDF Preview Error:', error);
            res.status(500).json({ error: 'Failed to generate PDF preview' });
        }
    }
}
exports.AssessmentController = AssessmentController;
