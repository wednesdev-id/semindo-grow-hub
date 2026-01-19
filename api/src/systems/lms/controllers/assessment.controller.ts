import { Request, Response } from 'express';
import { QuizService } from '../services/quiz.service';
import { AssignmentService } from '../services/assignment.service';

const quizService = new QuizService();
const assignmentService = new AssignmentService();

export class AssessmentController {
    // Quiz Methods
    async createQuiz(req: Request, res: Response) {
        try {
            const { lessonId } = req.params;
            const quiz = await quizService.createQuiz(lessonId, req.body);
            res.status(201).json({ data: quiz });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async getQuiz(req: Request, res: Response) {
        try {
            const { lessonId } = req.params;
            const quiz = await quizService.getQuiz(lessonId);
            if (!quiz) return res.status(404).json({ error: 'Quiz not found' });
            res.json({ data: quiz });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async submitQuiz(req: Request, res: Response) {
        try {
            const userId = (req as any).user.userId as string;
            const { quizId } = req.params;
            const { answers } = req.body;
            const attempt = await quizService.submitQuiz(userId, quizId, answers);
            res.json({ data: attempt });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async getQuizAttempts(req: Request, res: Response) {
        try {
            const userId = (req as any).user.userId as string;
            const { quizId } = req.params;
            const attempts = await quizService.getAttempts(userId, quizId);
            res.json({ data: attempts });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    // Assignment Methods
    async createAssignment(req: Request, res: Response) {
        try {
            const { lessonId } = req.params;
            const assignment = await assignmentService.createAssignment(lessonId, req.body);
            res.status(201).json({ data: assignment });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async getAssignment(req: Request, res: Response) {
        try {
            const { lessonId } = req.params;
            const assignment = await assignmentService.getAssignment(lessonId);
            if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
            res.json({ data: assignment });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async submitAssignment(req: Request, res: Response) {
        try {
            const userId = (req as any).user.userId as string;
            const { assignmentId } = req.params;
            const submission = await assignmentService.submitAssignment(userId, assignmentId, req.body);
            res.json({ data: submission });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async gradeAssignment(req: Request, res: Response) {
        try {
            const { submissionId } = req.params;
            const { grade, feedback } = req.body;
            const submission = await assignmentService.gradeAssignment(submissionId, grade, feedback);
            res.json({ data: submission });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async getAssignmentSubmissions(req: Request, res: Response) {
        try {
            const { assignmentId } = req.params;
            const submissions = await assignmentService.getSubmissions(assignmentId);
            res.json({ data: submissions });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
