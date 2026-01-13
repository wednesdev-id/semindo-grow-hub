import { Request, Response } from 'express';
import { PermissionsService } from '../services/permissions.service';

const permissionsService = new PermissionsService();

export class PermissionsController {
    async findAll(req: Request, res: Response) {
        try {
            const result = await permissionsService.findAll();
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async findById(req: Request, res: Response) {
        try {
            const result = await permissionsService.findById(req.params.id);
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(404).json({ success: false, error: error.message });
        }
    }

    async create(req: Request, res: Response) {
        try {
            const result = await permissionsService.create(req.body);
            res.status(201).json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async update(req: Request, res: Response) {
        try {
            const result = await permissionsService.update(req.params.id, req.body);
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const result = await permissionsService.delete(req.params.id);
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
}
