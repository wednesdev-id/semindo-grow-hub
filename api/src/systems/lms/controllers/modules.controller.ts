import { Request, Response } from 'express';
import { ModulesService } from '../services/modules.service';

const modulesService = new ModulesService();

export class ModulesController {
    async create(req: Request, res: Response) {
        try {
            const { courseId } = req.params;
            const { title, order } = req.body;

            if (!courseId) {
                return res.status(400).json({ error: 'Course ID is required' });
            }

            const module = await modulesService.create({
                title,
                order,
                course: { connect: { id: courseId } }
            });
            res.status(201).json({ data: module });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async findAll(req: Request, res: Response) {
        try {
            const { courseId } = req.params;
            const modules = await modulesService.findAll(courseId);
            res.json({ data: modules });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async findOne(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const module = await modulesService.findOne(id);
            if (!module) return res.status(404).json({ error: 'Module not found' });
            res.json({ data: module });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const module = await modulesService.update(id, req.body);
            res.json({ data: module });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const { id } = req.params;
            await modulesService.delete(id);
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async reorder(req: Request, res: Response) {
        try {
            const { courseId } = req.params;
            const { moduleIds } = req.body;
            await modulesService.reorder(courseId, moduleIds);
            res.status(200).json({ message: 'Modules reordered successfully' });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}
