/**
 * Archive Routes
 */

import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import * as archiveController from '../controllers/archive.controller';

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
// ARCHIVES / ARSIP
// ============================================

// List archives
router.get('/',
  authenticate,
  archiveController.listArchives
);

// Get statistics
router.get('/statistics',
  authenticate,
  archiveController.getStatistics
);

// Get by period
router.get('/period/:year/:month?',
  authenticate,
  archiveController.getArchivesByPeriod
);

// Get disposal candidates
router.get('/disposal/candidates',
  authenticate,
  requirePermission('arsip.arsip.delete'),
  archiveController.getDisposalCandidates
);

// Get by ID
router.get('/:id',
  authenticate,
  archiveController.getArchiveById
);

// Archive incoming letter
router.post('/incoming/:incomingLetterId',
  authenticate,
  requirePermission('arsip.arsip.create'),
  archiveController.archiveIncomingLetter
);

// Archive outgoing letter
router.post('/outgoing/:outgoingLetterId',
  authenticate,
  requirePermission('arsip.arsip.create'),
  archiveController.archiveOutgoingLetter
);

// Update archive
router.patch('/:id',
  authenticate,
  requirePermission('arsip.arsip.update'),
  archiveController.updateArchive
);

// Delete archive (soft delete)
router.delete('/:id',
  authenticate,
  requirePermission('arsip.arsip.delete'),
  archiveController.deleteArchive
);

export default router;
