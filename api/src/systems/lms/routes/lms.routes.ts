import { Router } from 'express';
import { CoursesController } from '../controllers/courses.controller';
import { authenticate, requireRole } from '../../middlewares/auth.middleware';

const router = Router();
const controller = new CoursesController();

// Public routes
router.get('/courses', controller.findAll);
router.get('/courses/:slug', controller.findBySlug);

// Protected routes
router.use(authenticate);
router.post('/courses', controller.create);
router.get('/courses/:id', controller.findOne);
router.patch('/courses/:id', controller.update);
router.delete('/courses/:id', controller.delete);

export const lmsRouter = router;
