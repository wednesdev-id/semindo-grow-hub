/**
 * Letter Subject Routes
 */

import { Router } from 'express';
import * as letterSubjectController from '../controllers/letter-subject.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

const router = Router();

// Public/Shared routes (authenticated)
router.use(authenticate);

router.get('/', letterSubjectController.listLetterSubjects);

// Admin only routes
router.post('/', authorize(['admin', 'staff']), letterSubjectController.createLetterSubject);
router.put('/:id', authorize(['admin', 'staff']), letterSubjectController.updateLetterSubject);
router.delete('/:id', authorize(['admin', 'staff']), letterSubjectController.deleteLetterSubject);

export default router;
