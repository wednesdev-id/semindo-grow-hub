/**
 * Template & Letterhead Routes
 */

import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { upload } from '../../../middleware/upload.middleware';
import * as templateController from '../controllers/template.controller';

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
// LETTER CATEGORIES
// ============================================

router.get('/categories',
  authenticate,
  templateController.listLetterCategories
);

router.post('/categories',
  authenticate,
  requirePermission('arsip.kategori.create'),
  templateController.createLetterCategory
);

router.patch('/categories/:id',
  authenticate,
  requirePermission('arsip.kategori.update'),
  templateController.updateLetterCategory
);

// ============================================
// LETTERHEADS / KOP SURAT
// ============================================

// Get default letterhead
router.get('/letterheads/default',
  authenticate,
  templateController.getDefaultLetterhead
);

// List letterheads
router.get('/letterheads',
  authenticate,
  templateController.listLetterheads
);

// Create letterhead with logo upload
router.post('/letterheads',
  authenticate,
  requirePermission('arsip.kop-surat.create'),
  upload.single('logo'),
  templateController.createLetterhead
);

// Update letterhead with logo upload
router.patch('/letterheads/:id',
  authenticate,
  requirePermission('arsip.kop-surat.update'),
  upload.single('logo'),
  templateController.updateLetterhead
);

// ============================================
// LETTER TEMPLATES
// ============================================

// List templates
router.get('/templates',
  authenticate,
  templateController.listLetterTemplates
);

// Get by ID
router.get('/templates/:id',
  authenticate,
  templateController.getLetterTemplateById
);

// Create template
router.post('/templates',
  authenticate,
  requirePermission('arsip.template.create'),
  templateController.createLetterTemplate
);

// Update template
router.patch('/templates/:id',
  authenticate,
  requirePermission('arsip.template.update'),
  templateController.updateLetterTemplate
);

// Delete template
router.delete('/templates/:id',
  authenticate,
  requirePermission('arsip.template.delete'),
  templateController.deleteLetterTemplate
);

// Render template with data
router.post('/templates/render',
  authenticate,
  templateController.renderTemplate
);

export default router;
