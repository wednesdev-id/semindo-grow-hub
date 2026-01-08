import { Request, Response } from 'express';
import { courseCategoryService } from '../services/course-category.service';

export class CourseCategoryController {
    async findAll(req: Request, res: Response) {
        try {
            const categories = await courseCategoryService.findAll();
            res.json({ data: categories });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async findById(req: Request, res: Response) {
        try {
            const category = await courseCategoryService.findById(req.params.id);
            if (!category) {
                return res.status(404).json({ error: 'Category not found' });
            }
            res.json({ data: category });
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const category = await courseCategoryService.create(req.body);
            res.status(201).json({ data: category });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const category = await courseCategoryService.update(req.params.id, req.body);
            res.json({ data: category });
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            await courseCategoryService.delete(req.params.id);
            res.status(204).send();
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }
}

export const courseCategoryController = new CourseCategoryController();
