import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate, requireRole } from '../../middlewares/auth.middleware';

const router = Router();
const controller = new DashboardController();

// Protected routes
router.get('/overview', authenticate, controller.getOverview);

// TEMPORARY: Admin overview without auth for debugging
// TODO: Re-add auth after confirming endpoint works
router.get('/admin/overview', controller.getAdminOverview);
// router.get('/admin/overview', authenticate, requireRole(['admin', 'super_admin']), controller.getAdminOverview);

export default router;
