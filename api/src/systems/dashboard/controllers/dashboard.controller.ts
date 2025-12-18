import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';

const dashboardService = new DashboardService();

export class DashboardController {
    async getOverview(req: Request, res: Response) {
        try {
            // Assuming user is attached to req by auth middleware
            const userId = (req as any).user?.id;
            const data = await dashboardService.getOverview(userId);
            res.json(data);
        } catch (error) {
            console.error('Dashboard overview error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }

    async getAdminOverview(req: Request, res: Response) {
        try {
            console.log('[Dashboard] Fetching admin overview...');
            const data = await dashboardService.getAdminOverview();
            res.json(data);
        } catch (error) {
            console.error('[Dashboard] Admin overview error:', error);
            res.status(500).json({ message: 'Failed to fetch admin dashboard data' });
        }
    }
}
