import { Request, Response } from 'express';
import { FinancingService } from '../services/financing.service';

const financingService = new FinancingService();

export class FinancingController {
    static async getPartners(req: Request, res: Response) {
        try {
            const partners = await financingService.getPartners();
            res.json({ data: partners });
        } catch (error) {
            console.error('Error fetching financing partners:', error);
            res.status(500).json({ error: 'Failed to fetch financing partners' });
        }
    }

    static async createApplication(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const application = await financingService.createApplication(userId, req.body);
            res.status(201).json({ data: application });
        } catch (error) {
            console.error('Error creating loan application:', error);
            res.status(500).json({ error: 'Failed to create loan application' });
        }
    }

    static async getMyApplications(req: Request, res: Response) {
        try {
            const userId = (req as any).user.id;
            const applications = await financingService.getMyApplications(userId);
            res.json({ data: applications });
        } catch (error) {
            console.error('Error fetching applications:', error);
            res.status(500).json({ error: 'Failed to fetch applications' });
        }
    }
}
