"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DashboardController = void 0;
const dashboard_service_1 = require("../services/dashboard.service");
const dashboardService = new dashboard_service_1.DashboardService();
class DashboardController {
    async getOverview(req, res) {
        try {
            // Assuming user is attached to req by auth middleware
            const userId = req.user?.id;
            const data = await dashboardService.getOverview(userId);
            res.json(data);
        }
        catch (error) {
            console.error('Dashboard overview error:', error);
            res.status(500).json({ message: 'Internal server error' });
        }
    }
    async getAdminOverview(req, res) {
        try {
            console.log('[Dashboard] Fetching admin overview...');
            const data = await dashboardService.getAdminOverview();
            res.json(data);
        }
        catch (error) {
            console.error('[Dashboard] Admin overview error:', error);
            res.status(500).json({ message: 'Failed to fetch admin dashboard data' });
        }
    }
}
exports.DashboardController = DashboardController;
