"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancingController = void 0;
const financing_service_1 = require("../services/financing.service");
const financingService = new financing_service_1.FinancingService();
class FinancingController {
    static async getPartners(req, res) {
        try {
            const partners = await financingService.getPartners();
            res.json({ data: partners });
        }
        catch (error) {
            console.error('Error fetching financing partners:', error);
            res.status(500).json({ error: 'Failed to fetch financing partners' });
        }
    }
    static async createApplication(req, res) {
        try {
            const userId = req.user.id;
            const application = await financingService.createApplication(userId, req.body);
            res.status(201).json({ data: application });
        }
        catch (error) {
            console.error('Error creating loan application:', error);
            res.status(500).json({ error: 'Failed to create loan application' });
        }
    }
    static async getMyApplications(req, res) {
        try {
            const userId = req.user.id;
            const applications = await financingService.getMyApplications(userId);
            res.json({ data: applications });
        }
        catch (error) {
            console.error('Error fetching applications:', error);
            res.status(500).json({ error: 'Failed to fetch applications' });
        }
    }
}
exports.FinancingController = FinancingController;
