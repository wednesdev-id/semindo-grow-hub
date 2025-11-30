import { Router } from 'express';
import { ProfileController } from '../controllers/profile.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router()
const controller = new ProfileController()

router.use(authenticate)

router.get('/me', controller.getMe)
router.put('/umkm', controller.updateUMKM)
router.put('/mentor', controller.updateMentor)

export const profileRouter = router
