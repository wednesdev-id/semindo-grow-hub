import { Router } from 'express';
import { AuditController } from '../controllers/audit.controller';
import { authenticate, requireRole } from '../../middlewares/auth.middleware';

const router = Router();
const controller = new AuditController();

// Apply authentication to all routes
router.use(authenticate);

// All audit log routes require admin role
router.use(requireRole(['admin', 'super_admin']));

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

export const auditRouter = router;
