import { Router } from 'express';
import { storeController } from '../controllers/store.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/stores/:slug', storeController.getStoreBySlug);

// Protected routes
router.post('/stores', authenticate, storeController.createStore);
router.get('/stores/me', authenticate, storeController.getMyStore);
router.patch('/stores/me', authenticate, storeController.updateMyStore);

export const storeRouter = router;
