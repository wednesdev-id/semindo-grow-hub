import { Request, Response } from 'express';
import { AuditService } from '../services/audit.service';

const auditService = new AuditService();

export class AuditController {
    async findAll(req: Request, res: Response) {
        try {
            const filters = {
                page: req.query.page ? parseInt(req.query.page as string) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
                userId: req.query.userId as string,
                action: req.query.action as string,
                resource: req.query.resource as string,
                resourceId: req.query.resourceId as string,
                startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
                endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
                search: req.query.search as string,
            };

            const result = await auditService.findAll(filters);
            res.json({ success: true, ...result });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async findById(req: Request, res: Response) {
        try {
            const result = await auditService.findById(req.params.id);
            res.json({ success: true, data: result });
        } catch (error: any) {
            res.status(404).json({ success: false, error: error.message });
        }
    }

    async getUserActivity(req: Request, res: Response) {
        try {
            const filters = {
                page: req.query.page ? parseInt(req.query.page as string) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
                startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
                endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
                action: req.query.action as string,
            };

            const result = await auditService.getUserActivity(req.params.userId, filters);
            res.json({ success: true, ...result });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async getResourceHistory(req: Request, res: Response) {
        try {
            const { resource, id } = req.params;
            const filters = {
                page: req.query.page ? parseInt(req.query.page as string) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
            };

            const result = await auditService.getResourceHistory(resource, id, filters);
            res.json({ success: true, ...result });
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    async exportLogs(req: Request, res: Response) {
        try {
            const filters = {
                userId: req.query.userId as string,
                action: req.query.action as string,
                resource: req.query.resource as string,
                startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
                endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
            };

            const csv = await auditService.exportLogs(filters);

            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');
            res.send(csv);
        } catch (error: any) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}
