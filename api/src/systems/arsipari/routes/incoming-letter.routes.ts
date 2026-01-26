/**
 * Incoming Letter Routes
 */

import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { uploadMemory } from '../../../middleware/upload-memory.middleware';
import * as incomingLetterController from '../controllers/incoming-letter.controller';

const router = Router();

// Permission check helper
const requirePermission = (permission: string) => {
  return (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    // TODO: Implement actual permission check from user roles
    next();
  };
};

// ============================================
// INCOMING LETTERS / SURAT MASUK
// ============================================

// List incoming letters
router.get('/',
  authenticate,
  incomingLetterController.listIncomingLetters
);

// Get statistics
router.get('/statistics',
  authenticate,
  incomingLetterController.getStatistics
);

// Get by ID
router.get('/:id',
  authenticate,
  incomingLetterController.getIncomingLetterById
);

// Create with file upload
router.post('/',
  authenticate,
  requirePermission('arsip.surat-masuk.create'),
  uploadMemory.single('file'),
  incomingLetterController.createIncomingLetter
);

// Update with file upload
router.patch('/:id',
  authenticate,
  requirePermission('arsip.surat-masuk.update'),
  uploadMemory.single('file'),
  incomingLetterController.updateIncomingLetter
);

// Update status
router.patch('/:id/status',
  authenticate,
  requirePermission('arsip.surat-masuk.update'),
  incomingLetterController.updateStatus
);

// Delete
router.delete('/:id',
  authenticate,
  requirePermission('arsip.surat-masuk.delete'),
  incomingLetterController.deleteIncomingLetter
);

export default router;
