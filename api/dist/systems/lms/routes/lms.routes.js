"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lmsRouter = void 0;
const express_1 = require("express");
const courses_controller_1 = require("../controllers/courses.controller");
const modules_controller_1 = require("../controllers/modules.controller");
const lessons_controller_1 = require("../controllers/lessons.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const controller = new courses_controller_1.CoursesController();
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
router.post('/courses/:id/enroll', controller.enroll);
router.get('/my-courses', controller.getMyCourses);
router.patch('/lessons/:id/progress', controller.updateProgress);
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
router.get('/lessons/:id', lessonsController.findOne);
router.patch('/lessons/:id', lessonsController.update);
router.delete('/lessons/:id', lessonsController.delete);
router.post('/modules/:moduleId/lessons/reorder', lessonsController.reorder);
exports.lmsRouter = router;
