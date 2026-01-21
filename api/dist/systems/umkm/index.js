"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.umkmRouter = void 0;
const express_1 = require("express");
const umkm_controller_1 = require("./controllers/umkm.controller");
const segmentation_controller_1 = require("./controllers/segmentation.controller");
const auth_middleware_1 = require("../middlewares/auth.middleware");
exports.umkmRouter = (0, express_1.Router)();
// Debug log to verify routes are being loaded  
console.log('[UMKM Router] Initializing routes...');
console.log('[UMKM Router] SegmentationController:', typeof segmentation_controller_1.SegmentationController);
console.log('[UMKM Router] RegionController:', typeof segmentation_controller_1.RegionController);
// ============================================
// SEGMENTATION ROUTES
// ============================================
// Stats and list (admin/management only)
exports.umkmRouter.get('/segmentation/stats', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin', 'management']), segmentation_controller_1.SegmentationController.getStats);
exports.umkmRouter.get('/segmentation/list', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin', 'management', 'mentor']), segmentation_controller_1.SegmentationController.getList);
// Calculate preview (no save)
exports.umkmRouter.post('/calculate-segmentation', auth_middleware_1.authenticate, segmentation_controller_1.SegmentationController.calculatePreview);
// Bulk recalculate (admin only)
exports.umkmRouter.post('/segmentation/bulk-recalculate', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin']), segmentation_controller_1.SegmentationController.bulkRecalculate);
// ============================================
// REGION MAPPING ROUTES
// ============================================
// Province data
exports.umkmRouter.get('/regions', auth_middleware_1.authenticate, segmentation_controller_1.RegionController.getProvinces);
exports.umkmRouter.get('/regions/:province', auth_middleware_1.authenticate, segmentation_controller_1.RegionController.getProvinceStats);
exports.umkmRouter.get('/regions/:province/cities', auth_middleware_1.authenticate, segmentation_controller_1.RegionController.getCities);
exports.umkmRouter.get('/regions/:province/:city', auth_middleware_1.authenticate, segmentation_controller_1.RegionController.getCityStats);
// Map data
exports.umkmRouter.get('/map-data', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin', 'management']), segmentation_controller_1.RegionController.getMapData);
exports.umkmRouter.get('/heatmap', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin', 'management']), segmentation_controller_1.RegionController.getHeatmap);
// ============================================
// EXISTING UMKM ROUTES
// ============================================
// Public/Shared Routes
exports.umkmRouter.get('/stats', auth_middleware_1.authenticate, umkm_controller_1.UMKMController.getStats);
exports.umkmRouter.get('/', auth_middleware_1.authenticate, umkm_controller_1.UMKMController.getProfiles);
exports.umkmRouter.get('/:id', auth_middleware_1.authenticate, umkm_controller_1.UMKMController.getProfile);
// UMKM Owner Routes
exports.umkmRouter.post('/', auth_middleware_1.authenticate, umkm_controller_1.UMKMController.createProfile);
exports.umkmRouter.patch('/:id', auth_middleware_1.authenticate, umkm_controller_1.UMKMController.updateProfile);
// Recalculate segmentation for single UMKM
exports.umkmRouter.post('/:id/recalculate-segmentation', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin', 'management']), segmentation_controller_1.SegmentationController.recalculate);
const upload_middleware_1 = require("../../middleware/upload.middleware");
// Documents
exports.umkmRouter.post('/:id/documents', auth_middleware_1.authenticate, upload_middleware_1.upload.single('file'), umkm_controller_1.UMKMController.uploadDocument);
exports.umkmRouter.patch('/documents/:docId/verify', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin', 'internal_ops']), umkm_controller_1.UMKMController.verifyDocument);
// Mentoring
exports.umkmRouter.get('/:id/mentoring', auth_middleware_1.authenticate, umkm_controller_1.UMKMController.getMentoringSessions);
exports.umkmRouter.post('/mentoring', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['admin', 'mentor', 'internal_ops']), umkm_controller_1.UMKMController.addMentoringSession);
// ============================================
// MENTOR EVENTS ROUTES
// ============================================
const mentor_event_routes_1 = __importDefault(require("./routes/mentor-event.routes"));
exports.umkmRouter.use('/mentor-events', mentor_event_routes_1.default);
