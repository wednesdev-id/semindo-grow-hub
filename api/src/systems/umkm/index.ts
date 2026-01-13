import { Router } from 'express';
import { UMKMController } from './controllers/umkm.controller';
import { SegmentationController, RegionController } from './controllers/segmentation.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

export const umkmRouter = Router();

// Debug log to verify routes are being loaded  
console.log('[UMKM Router] Initializing routes...');
console.log('[UMKM Router] SegmentationController:', typeof SegmentationController);
console.log('[UMKM Router] RegionController:', typeof RegionController);

// ============================================
// SEGMENTATION ROUTES
// ============================================

// Stats and list (admin/management only)
umkmRouter.get('/segmentation/stats', authenticate, authorize(['admin', 'management']), SegmentationController.getStats);
umkmRouter.get('/segmentation/list', authenticate, authorize(['admin', 'management', 'mentor']), SegmentationController.getList);

// Calculate preview (no save)
umkmRouter.post('/calculate-segmentation', authenticate, SegmentationController.calculatePreview);

// Bulk recalculate (admin only)
umkmRouter.post('/segmentation/bulk-recalculate', authenticate, authorize(['admin']), SegmentationController.bulkRecalculate);

// ============================================
// REGION MAPPING ROUTES
// ============================================

// Province data
umkmRouter.get('/regions', authenticate, RegionController.getProvinces);
umkmRouter.get('/regions/:province', authenticate, RegionController.getProvinceStats);
umkmRouter.get('/regions/:province/cities', authenticate, RegionController.getCities);
umkmRouter.get('/regions/:province/:city', authenticate, RegionController.getCityStats);

// Map data
umkmRouter.get('/map-data', authenticate, authorize(['admin', 'management']), RegionController.getMapData);
umkmRouter.get('/heatmap', authenticate, authorize(['admin', 'management']), RegionController.getHeatmap);

// ============================================
// EXISTING UMKM ROUTES
// ============================================

// Public/Shared Routes
umkmRouter.get('/stats', authenticate, UMKMController.getStats);
umkmRouter.get('/', authenticate, UMKMController.getProfiles);
umkmRouter.get('/:id', authenticate, UMKMController.getProfile);

// UMKM Owner Routes
umkmRouter.post('/', authenticate, UMKMController.createProfile);
umkmRouter.patch('/:id', authenticate, UMKMController.updateProfile);

// Recalculate segmentation for single UMKM
umkmRouter.post('/:id/recalculate-segmentation', authenticate, authorize(['admin', 'management']), SegmentationController.recalculate);

import { upload } from '../../middleware/upload.middleware';

// Documents
umkmRouter.post('/:id/documents', authenticate, upload.single('file'), UMKMController.uploadDocument);
umkmRouter.patch('/documents/:docId/verify', authenticate, authorize(['admin', 'internal_ops']), UMKMController.verifyDocument);

// Mentoring
umkmRouter.get('/:id/mentoring', authenticate, UMKMController.getMentoringSessions);
umkmRouter.post('/mentoring', authenticate, authorize(['admin', 'mentor', 'internal_ops']), UMKMController.addMentoringSession);

// ============================================
// MENTOR EVENTS ROUTES
// ============================================

import mentorEventRoutes from './routes/mentor-event.routes';
umkmRouter.use('/mentor-events', mentorEventRoutes);
