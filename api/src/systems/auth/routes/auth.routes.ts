import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router()
const authController = new AuthController()

router.post('/register', authController.register)
router.post('/login', authController.login)
router.post('/logout', authenticate, authController.logout)
router.get('/me', authenticate, authController.getMe)

export const authRouter = router
