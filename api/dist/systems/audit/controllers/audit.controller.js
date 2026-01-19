"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditController = void 0;
const audit_service_1 = require("../services/audit.service");
const auditService = new audit_service_1.AuditService();
class AuditController {
    async findAll(req, res) {
        try {
            const filters = {
                page: req.query.page ? parseInt(req.query.page) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit) : undefined,
                userId: req.query.userId,
                action: req.query.action,
                resource: req.query.resource,
                resourceId: req.query.resourceId,
                startDate: req.query.startDate ? new Date(req.query.startDate) : undefined,
                endDate: req.query.endDate ? new Date(req.query.endDate) : undefined,
                search: req.query.search,
            };
            const result = await auditService.findAll(filters);
            res.json({ success: true, ...result });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
    async findById(req, res) {
        try {
            const result = await auditService.findById(req.params.id);
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(404).json({ success: false, error: error.message });
        }
    }
    async getUserActivity(req, res) {
        try {
            const filters = {
                page: req.query.page ? parseInt(req.query.page) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit) : undefined,
                startDate: req.query.startDate ? new Date(req.query.startDate) : undefined,
                endDate: req.query.endDate ? new Date(req.query.endDate) : undefined,
                action: req.query.action,
            };
            const result = await auditService.getUserActivity(req.params.userId, filters);
            res.json({ success: true, ...result });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
    async getResourceHistory(req, res) {
        try {
            const { resource, id } = req.params;
            const filters = {
                page: req.query.page ? parseInt(req.query.page) : undefined,
                limit: req.query.limit ? parseInt(req.query.limit) : undefined,
            };
            const result = await auditService.getResourceHistory(resource, id, filters);
            res.json({ success: true, ...result });
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
    async exportLogs(req, res) {
        try {
            const filters = {
                userId: req.query.userId,
                action: req.query.action,
                resource: req.query.resource,
                startDate: req.query.startDate ? new Date(req.query.startDate) : undefined,
                endDate: req.query.endDate ? new Date(req.query.endDate) : undefined,
            };
            const csv = await auditService.exportLogs(filters);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');
            res.send(csv);
        }
        catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}
exports.AuditController = AuditController;
