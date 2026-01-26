/**
 * Disposition Routes
 */

import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import * as dispositionController from '../controllers/disposition.controller';

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
// DISPOSITIONS / DISPOSISI
// ============================================

// Get pending count for current user
router.get('/pending/count',
  authenticate,
  dispositionController.getPendingCount
);

// List dispositions
router.get('/',
  authenticate,
  dispositionController.listDispositions
);

// Get by ID
router.get('/:id',
  authenticate,
  dispositionController.getDispositionById
);

// Get disposition chain for incoming letter
router.get('/letter/:incomingLetterId/chain',
  authenticate,
  dispositionController.getDispositionChain
);

// Create disposition
router.post('/',
  authenticate,
  requirePermission('arsip.disposisi.create'),
  dispositionController.createDisposition
);

// Update disposition status
router.patch('/:id',
  authenticate,
  dispositionController.updateDisposition
);

// Delete disposition
router.delete('/:id',
  authenticate,
  dispositionController.deleteDisposition
);

export default router;
