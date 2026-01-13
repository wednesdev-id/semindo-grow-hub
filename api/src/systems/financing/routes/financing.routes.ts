import { Router } from 'express';
import { FinancingController } from '../controllers/financing.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

router.get('/partners', FinancingController.getPartners);
router.post('/apply', authenticate, FinancingController.createApplication);
router.get('/applications', authenticate, FinancingController.getMyApplications);

export default router;
