import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { CoursesController } from '../controllers/courses.controller';
import { ModulesController } from '../controllers/modules.controller';
import { LessonsController } from '../controllers/lessons.controller';
import { ResourceController } from '../controllers/resource.controller';
import { AssessmentController } from '../controllers/assessment.controller';
import { authenticate, requireRole } from '../../middlewares/auth.middleware';
import { requireUMKMAccess } from '../../middlewares/umkm-access.middleware';

const router = Router();
const controller = new CoursesController();
const assessmentController = new AssessmentController();

import { WebinarController } from '../controllers/webinar.controller';
const webinarController = new WebinarController();

// Configure Multer
const storage = multer.memoryStorage();

const upload = multer({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf|mp4|webm/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Invalid file type. Allowed: Images, PDF, Video (MP4, WebM)'));
    }
});

const resourceController = new ResourceController();
router.post('/resources/upload',
    (req, res, next) => {
        console.log('[LMS] Upload Request Headers:', req.headers);
        next();
    },
    authenticate,
    (req, res, next) => {
        upload.single('file')(req, res, (err) => {
            if (err) {
                console.error('[LMS] Multer Error:', err);
                return res.status(400).json({ error: err.message });
            }
            console.log('[LMS] Multer Success, File:', req.file);
            next();
        });
    },
    resourceController.upload
);

// Assessment Routes (Quiz & Assignment)
router.post('/lessons/:lessonId/quiz', authenticate, requireRole(['admin', 'mentor', 'konsultan', 'umkm']), assessmentController.createQuiz);
router.get('/lessons/:lessonId/quiz', authenticate, assessmentController.getQuiz);
router.post('/quizzes/:quizId/submit', authenticate, assessmentController.submitQuiz);
router.get('/quizzes/:quizId/attempts', authenticate, assessmentController.getQuizAttempts);

router.post('/lessons/:lessonId/assignment', authenticate, requireRole(['admin', 'mentor', 'konsultan', 'umkm']), assessmentController.createAssignment);
router.get('/lessons/:lessonId/assignment', authenticate, assessmentController.getAssignment);
router.post('/assignments/:assignmentId/submit', authenticate, assessmentController.submitAssignment);
router.post('/submissions/:submissionId/grade', authenticate, requireRole(['admin', 'mentor', 'konsultan', 'umkm']), assessmentController.gradeAssignment);
router.get('/assignments/:assignmentId/submissions', authenticate, requireRole(['admin', 'mentor', 'konsultan', 'umkm']), assessmentController.getAssignmentSubmissions);

// Public routes
router.get('/courses', controller.findAll);
router.get('/courses/:slug', controller.findBySlug);
router.get('/webinars', webinarController.findAll);
router.get('/webinars/:id', webinarController.findOne);

// Protected routes
router.use(authenticate);
router.post('/courses', controller.create);
router.get('/courses/:id', controller.findOne);
router.patch('/courses/:id', controller.update);
router.delete('/courses/:id', controller.delete);

// Enrollment & Progress
router.post('/courses/:id/enroll', requireUMKMAccess, controller.enroll);
router.get('/courses/:id/enrollment-status', controller.checkEnrollment);
router.get('/my-courses', controller.getMyCourses);
router.patch('/lessons/:id/progress', controller.updateProgress);

// Instructor Routes
// Instructor Routes
router.get('/instructor/courses', authenticate, requireRole(['trainer', 'admin', 'konsultan', 'umkm']), controller.getInstructorCourses);
router.get('/instructor/stats', authenticate, requireRole(['trainer', 'admin', 'konsultan', 'umkm']), controller.getInstructorStats);


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
// Note: We might need to check course access for lessons too, but that requires looking up the course from the lesson.
// For now, let's assume enrollment check handles it (you can't see lessons if not enrolled, and you can't enroll if not UMKM).
// But for direct lesson access if we want strict check:
// router.get('/lessons/:id', lessonsController.findOne); 
// The lessonsController.findOne typically checks enrollment.

router.get('/lessons/:id', lessonsController.findOne);
router.patch('/lessons/:id', lessonsController.update);
router.delete('/lessons/:id', lessonsController.delete);
router.post('/modules/:moduleId/lessons/reorder', lessonsController.reorder);

import { courseCategoryController } from '../controllers/course-category.controller';

// Course Category Routes
router.get('/categories', authenticate, courseCategoryController.findAll);
router.get('/categories/:id', authenticate, courseCategoryController.findById);
router.post('/categories', authenticate, requireRole(['admin']), courseCategoryController.create);
router.patch('/categories/:id', authenticate, requireRole(['admin']), courseCategoryController.update);
router.delete('/categories/:id', authenticate, requireRole(['admin']), courseCategoryController.delete);

export const lmsRouter = router;
