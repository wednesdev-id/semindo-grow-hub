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

// Enrollment & Progress
router.post('/courses/:id/enroll', controller.enroll);
router.get('/my-courses', controller.getMyCourses);
router.patch('/lessons/:id/progress', controller.updateProgress);

export const lmsRouter = router;
