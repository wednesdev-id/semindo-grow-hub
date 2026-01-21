"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.profileRouter = void 0;
const express_1 = require("express");
const profile_controller_1 = require("../controllers/profile.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const controller = new profile_controller_1.ProfileController();
router.use(auth_middleware_1.authenticate);
// Profile endpoints
router.get('/me', controller.getMe);
// UMKM Profile CRUD - supports 1:N relation (user can have multiple UMKM)
router.get('/umkm', controller.getMyUMKMProfiles); // Get all user's UMKM profiles
router.get('/umkm/:id', controller.getUMKMProfile); // Get specific UMKM profile
router.post('/umkm', controller.createUMKM); // Create new UMKM profile
router.put('/umkm', controller.updateUMKM); // Update first/create UMKM (backward compat)
router.put('/umkm/:id', controller.updateUMKMById); // Update specific UMKM by ID
router.delete('/umkm/:id', controller.deleteUMKM); // Delete UMKM profile
// Admin: UMKM Approval Workflow
router.get('/umkm-pending', controller.getPendingProfiles); // Get all pending UMKM
router.post('/umkm/:id/approve', controller.approveUMKM); // Approve UMKM profile
router.post('/umkm/:id/reject', controller.rejectUMKM); // Reject UMKM profile
// Mentor Profile
router.put('/mentor', controller.updateMentor);
exports.profileRouter = router;
