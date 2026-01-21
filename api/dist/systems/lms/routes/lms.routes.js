"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.lmsRouter = void 0;
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const courses_controller_1 = require("../controllers/courses.controller");
const modules_controller_1 = require("../controllers/modules.controller");
const lessons_controller_1 = require("../controllers/lessons.controller");
const resource_controller_1 = require("../controllers/resource.controller");
const assessment_controller_1 = require("../controllers/assessment.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const umkm_access_middleware_1 = require("../../middlewares/umkm-access.middleware");
const router = (0, express_1.Router)();
const controller = new courses_controller_1.CoursesController();
const assessmentController = new assessment_controller_1.AssessmentController();
// Configure Multer
const uploadDir = path_1.default.join(__dirname, '../../../../uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage,
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|pdf|mp4|webm/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Invalid file type. Allowed: Images, PDF, Video (MP4, WebM)'));
    }
});
const resourceController = new resource_controller_1.ResourceController();
router.post('/resources/upload', auth_middleware_1.authenticate, upload.single('file'), resourceController.upload);
// Assessment Routes (Quiz & Assignment)
router.post('/lessons/:lessonId/quiz', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)(['admin', 'mentor', 'konsultan', 'umkm']), assessmentController.createQuiz);
router.get('/lessons/:lessonId/quiz', auth_middleware_1.authenticate, assessmentController.getQuiz);
router.post('/quizzes/:quizId/submit', auth_middleware_1.authenticate, assessmentController.submitQuiz);
router.get('/quizzes/:quizId/attempts', auth_middleware_1.authenticate, assessmentController.getQuizAttempts);
router.post('/lessons/:lessonId/assignment', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)(['admin', 'mentor', 'konsultan', 'umkm']), assessmentController.createAssignment);
router.get('/lessons/:lessonId/assignment', auth_middleware_1.authenticate, assessmentController.getAssignment);
router.post('/assignments/:assignmentId/submit', auth_middleware_1.authenticate, assessmentController.submitAssignment);
router.post('/submissions/:submissionId/grade', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)(['admin', 'mentor', 'konsultan', 'umkm']), assessmentController.gradeAssignment);
router.get('/assignments/:assignmentId/submissions', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)(['admin', 'mentor', 'konsultan', 'umkm']), assessmentController.getAssignmentSubmissions);
// Public routes
router.get('/courses', controller.findAll);
router.get('/courses/:slug', controller.findBySlug);
// Protected routes
router.use(auth_middleware_1.authenticate);
router.post('/courses', controller.create);
router.get('/courses/:id', controller.findOne);
router.patch('/courses/:id', controller.update);
router.delete('/courses/:id', controller.delete);
// Enrollment & Progress
router.post('/courses/:id/enroll', umkm_access_middleware_1.requireUMKMAccess, controller.enroll);
router.get('/courses/:id/enrollment-status', controller.checkEnrollment);
router.get('/my-courses', controller.getMyCourses);
router.patch('/lessons/:id/progress', controller.updateProgress);
// Instructor Routes
// Instructor Routes
router.get('/instructor/courses', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)(['trainer', 'admin', 'konsultan', 'umkm']), controller.getInstructorCourses);
router.get('/instructor/stats', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)(['trainer', 'admin', 'konsultan', 'umkm']), controller.getInstructorStats);
// Modules Routes
const modulesController = new modules_controller_1.ModulesController();
router.post('/courses/:courseId/modules', modulesController.create);
router.get('/courses/:courseId/modules', modulesController.findAll);
router.get('/modules/:id', modulesController.findOne);
router.patch('/modules/:id', modulesController.update);
router.delete('/modules/:id', modulesController.delete);
router.post('/courses/:courseId/modules/reorder', modulesController.reorder);
// Lessons Routes
const lessonsController = new lessons_controller_1.LessonsController();
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
const course_category_controller_1 = require("../controllers/course-category.controller");
// Course Category Routes
router.get('/categories', auth_middleware_1.authenticate, course_category_controller_1.courseCategoryController.findAll);
router.get('/categories/:id', auth_middleware_1.authenticate, course_category_controller_1.courseCategoryController.findById);
router.post('/categories', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)(['admin']), course_category_controller_1.courseCategoryController.create);
router.patch('/categories/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)(['admin']), course_category_controller_1.courseCategoryController.update);
router.delete('/categories/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.requireRole)(['admin']), course_category_controller_1.courseCategoryController.delete);
exports.lmsRouter = router;
