"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AssessmentController = void 0;
const quiz_service_1 = require("../services/quiz.service");
const assignment_service_1 = require("../services/assignment.service");
const quizService = new quiz_service_1.QuizService();
const assignmentService = new assignment_service_1.AssignmentService();
class AssessmentController {
    // Quiz Methods
    async createQuiz(req, res) {
        try {
            const { lessonId } = req.params;
            const quiz = await quizService.createQuiz(lessonId, req.body);
            res.status(201).json({ data: quiz });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getQuiz(req, res) {
        try {
            const { lessonId } = req.params;
            const quiz = await quizService.getQuiz(lessonId);
            if (!quiz)
                return res.status(404).json({ error: 'Quiz not found' });
            res.json({ data: quiz });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async submitQuiz(req, res) {
        try {
            const userId = req.user.userId;
            const { quizId } = req.params;
            const { answers } = req.body;
            const attempt = await quizService.submitQuiz(userId, quizId, answers);
            res.json({ data: attempt });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getQuizAttempts(req, res) {
        try {
            const userId = req.user.userId;
            const { quizId } = req.params;
            const attempts = await quizService.getAttempts(userId, quizId);
            res.json({ data: attempts });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    // Assignment Methods
    async createAssignment(req, res) {
        try {
            const { lessonId } = req.params;
            const assignment = await assignmentService.createAssignment(lessonId, req.body);
            res.status(201).json({ data: assignment });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getAssignment(req, res) {
        try {
            const { lessonId } = req.params;
            const assignment = await assignmentService.getAssignment(lessonId);
            if (!assignment)
                return res.status(404).json({ error: 'Assignment not found' });
            res.json({ data: assignment });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async submitAssignment(req, res) {
        try {
            const userId = req.user.userId;
            const { assignmentId } = req.params;
            const submission = await assignmentService.submitAssignment(userId, assignmentId, req.body);
            res.json({ data: submission });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async gradeAssignment(req, res) {
        try {
            const { submissionId } = req.params;
            const { grade, feedback } = req.body;
            const submission = await assignmentService.gradeAssignment(submissionId, grade, feedback);
            res.json({ data: submission });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
    async getAssignmentSubmissions(req, res) {
        try {
            const { assignmentId } = req.params;
            const submissions = await assignmentService.getSubmissions(assignmentId);
            res.json({ data: submissions });
        }
        catch (error) {
            res.status(400).json({ error: error.message });
        }
    }
}
exports.AssessmentController = AssessmentController;
