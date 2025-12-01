import { Router } from 'express';
import { UMKMController } from './controllers/umkm.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

export const umkmRouter = Router();

// Public/Shared Routes
umkmRouter.get('/stats', authenticate, UMKMController.getStats);
umkmRouter.get('/', authenticate, UMKMController.getProfiles);
umkmRouter.get('/:id', authenticate, UMKMController.getProfile);

// UMKM Owner Routes
umkmRouter.post('/', authenticate, UMKMController.createProfile);
umkmRouter.patch('/:id', authenticate, UMKMController.updateProfile);

import { upload } from '../../middleware/upload.middleware';

// Documents
umkmRouter.post('/:id/documents', authenticate, upload.single('file'), UMKMController.uploadDocument);
umkmRouter.patch('/documents/:docId/verify', authenticate, authorize(['admin', 'internal_ops']), UMKMController.verifyDocument);

// Mentoring
umkmRouter.get('/:id/mentoring', authenticate, UMKMController.getMentoringSessions);
umkmRouter.post('/mentoring', authenticate, authorize(['admin', 'mentor', 'internal_ops']), UMKMController.addMentoringSession);
