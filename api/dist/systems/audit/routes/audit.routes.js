"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditRouter = void 0;
const express_1 = require("express");
const audit_controller_1 = require("../controllers/audit.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const controller = new audit_controller_1.AuditController();
// Apply authentication to all routes
router.use(auth_middleware_1.authenticate);
// All audit log routes require admin role
router.use((0, auth_middleware_1.requireRole)(['admin', 'super_admin']));
// GET /api/v1/audit-logs - List all logs
router.get('/', controller.findAll);
// GET /api/v1/audit-logs/export - Export logs to CSV
router.get('/export', controller.exportLogs);
// GET /api/v1/audit-logs/user/:userId - Get user activity
router.get('/user/:userId', controller.getUserActivity);
// GET /api/v1/audit-logs/resource/:resource/:id - Get resource history
router.get('/resource/:resource/:id', controller.getResourceHistory);
// GET /api/v1/audit-logs/:id - Get log details
router.get('/:id', controller.findById);
exports.auditRouter = router;
