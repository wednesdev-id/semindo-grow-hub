"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.programRouter = void 0;
const express_1 = require("express");
const program_controller_1 = require("../controllers/program.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const controller = new program_controller_1.ProgramController();
// Public routes
router.get('/', controller.getPrograms);
router.get('/:id', controller.getProgramById);
// Protected routes (Admin/Mentor)
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin', 'mentor']), controller.createProgram);
router.post('/:id/batches', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin', 'mentor']), controller.createBatch);
router.get('/batches/:batchId/participants', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin', 'mentor']), controller.getBatchParticipants);
router.patch('/participants/:participantId/status', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin', 'mentor']), controller.updateParticipantStatus);
router.post('/:id/milestones', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin', 'mentor']), controller.createMilestone);
router.get('/:id/milestones', auth_middleware_1.authenticate, controller.getProgramMilestones);
// User routes
router.post('/batches/:batchId/apply', auth_middleware_1.authenticate, controller.applyToBatch);
router.get('/me/participations', auth_middleware_1.authenticate, controller.getMyParticipations);
exports.programRouter = router;
