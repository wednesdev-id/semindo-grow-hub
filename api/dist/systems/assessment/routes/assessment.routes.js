"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assessmentRouter = void 0;
const express_1 = require("express");
const assessment_controller_1 = require("../controllers/assessment.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const cache_middleware_1 = require("../../middlewares/cache.middleware");
const router = (0, express_1.Router)();
const controller = new assessment_controller_1.AssessmentController();
// All routes require authentication
router.use(auth_middleware_1.authenticate);
router.post('/', (req, res, next) => {
    console.log('Assessment POST / hit');
    next();
}, controller.create);
router.get('/templates', (0, cache_middleware_1.cacheMiddleware)(300), controller.getTemplates);
router.get('/templates/:category', (0, cache_middleware_1.cacheMiddleware)(300), controller.getTemplates);
router.get('/me', controller.getMyAssessments);
router.get('/:id', controller.getOne);
router.post('/:id/responses', controller.saveResponse);
router.post('/:id/submit', controller.submit);
router.get('/:id/pdf', controller.downloadPdf);
router.get('/:id/preview', controller.previewPdf);
exports.assessmentRouter = router;
