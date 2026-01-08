import { Request, Response } from 'express';
import { LessonsService } from '../services/lessons.service';

const lessonsService = new LessonsService();

export class LessonsController {
    async create(req: Request, res: Response) {
        try {
            console.log('=== LESSON CREATE REQUEST ===');
            console.log('Params:', req.params);
            console.log('Body:', JSON.stringify(req.body, null, 2));

            const { moduleId } = req.params;

            if (!moduleId) {
                console.error('ERROR: moduleId is missing from params');
                return res.status(400).json({ error: 'Module ID is required' });
            }

            console.log('Calling lessonsService.create with moduleId:', moduleId);
            const lesson = await lessonsService.create(moduleId, req.body);

            console.log('Lesson created successfully:', lesson.id);
            res.status(201).json({ data: lesson });
        } catch (error: any) {
            console.error('=== LESSON CREATION ERROR ===');
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
            res.status(400).json({ error: error.message || 'Failed to create lesson' });
        }
    }

    async findAll(req: Request, res: Response) {
        try {
            const { moduleId } = req.params;
            const lessons = await lessonsService.findAll(moduleId);
            res.json({ data: lessons });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async findOne(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const lesson = await lessonsService.findOne(id);
            if (!lesson) return res.status(404).json({ error: 'Lesson not found' });
            res.json({ data: lesson });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const lesson = await lessonsService.update(id, req.body);
            res.json({ data: lesson });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await lessonsService.delete(id);
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async reorder(req: Request, res: Response) {
        try {
            const { moduleId } = req.params;
            const { lessonIds } = req.body;
            await lessonsService.reorder(moduleId, lessonIds);
            res.status(200).json({ message: 'Lessons reordered successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
