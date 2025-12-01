import { Router } from 'express';
import { DashboardController } from '../controllers/dashboard.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();
const dashboardController = new DashboardController();

router.get('/overview', authenticate, dashboardController.getOverview);

export default router;
