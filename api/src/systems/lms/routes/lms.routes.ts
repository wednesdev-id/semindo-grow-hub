import { Router } from 'express';
import { CoursesController } from '../controllers/courses.controller';
import { ModulesController } from '../controllers/modules.controller';
import { LessonsController } from '../controllers/lessons.controller';
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

// Modules Routes
const modulesController = new ModulesController();
router.post('/courses/:courseId/modules', modulesController.create);
router.get('/courses/:courseId/modules', modulesController.findAll);
router.get('/modules/:id', modulesController.findOne);
router.patch('/modules/:id', modulesController.update);
router.delete('/modules/:id', modulesController.delete);
router.post('/courses/:courseId/modules/reorder', modulesController.reorder);

// Lessons Routes
const lessonsController = new LessonsController();
router.post('/modules/:moduleId/lessons', lessonsController.create);
router.get('/modules/:moduleId/lessons', lessonsController.findAll);
router.get('/lessons/:id', lessonsController.findOne);
router.patch('/lessons/:id', lessonsController.update);
router.delete('/lessons/:id', lessonsController.delete);
router.post('/modules/:moduleId/lessons/reorder', lessonsController.reorder);

export const lmsRouter = router;
