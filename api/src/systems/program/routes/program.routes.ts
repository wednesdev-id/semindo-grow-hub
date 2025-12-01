import { Router } from 'express';
import { ProgramController } from '../controllers/program.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

const router = Router();
const controller = new ProgramController();

// Public routes
router.get('/', controller.getPrograms);
router.get('/:id', controller.getProgramById);

// Protected routes (Admin/Mentor)
router.post('/', authenticate, authorize(['admin', 'mentor']), controller.createProgram);
router.post('/:id/batches', authenticate, authorize(['admin', 'mentor']), controller.createBatch);
router.get('/batches/:batchId/participants', authenticate, authorize(['admin', 'mentor']), controller.getBatchParticipants);
router.patch('/participants/:participantId/status', authenticate, authorize(['admin', 'mentor']), controller.updateParticipantStatus);

// User routes
router.post('/batches/:batchId/apply', authenticate, controller.applyToBatch);
router.get('/me/participations', authenticate, controller.getMyParticipations);

export const programRouter = router;
