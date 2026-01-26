/**
 * Outgoing Letter Routes
 */

import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import * as outgoingLetterController from '../controllers/outgoing-letter.controller';

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
// OUTGOING LETTERS / SURAT KELUAR
// ============================================

// List outgoing letters
router.get('/',
  authenticate,
  outgoingLetterController.listOutgoingLetters
);

// Get statistics
router.get('/statistics',
  authenticate,
  outgoingLetterController.getStatistics
);

// Get by ID
router.get('/:id',
  authenticate,
  outgoingLetterController.getOutgoingLetterById
);

// Create draft
router.post('/',
  authenticate,
  requirePermission('arsip.surat-keluar.create'),
  outgoingLetterController.createOutgoingLetter
);

// Update
router.patch('/:id',
  authenticate,
  requirePermission('arsip.surat-keluar.update'),
  outgoingLetterController.updateOutgoingLetter
);

// Submit for approval
router.post('/:id/submit',
  authenticate,
  requirePermission('arsip.surat-keluar.submit'),
  outgoingLetterController.submitApproval
);

// Process approval (approve/reject)
router.post('/:id/approvals/:approvalId',
  authenticate,
  requirePermission('arsip.surat-keluar.approve'),
  outgoingLetterController.processApproval
);

// Publish letter
router.post('/:id/publish',
  authenticate,
  requirePermission('arsip.surat-keluar.publish'),
  outgoingLetterController.publishLetter
);

// Delete
router.delete('/:id',
  authenticate,
  requirePermission('arsip.surat-keluar.delete'),
  outgoingLetterController.deleteOutgoingLetter
);

export default router;
