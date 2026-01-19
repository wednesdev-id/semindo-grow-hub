"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const consultantController = __importStar(require("../controllers/consultant.controller"));
const bookingController = __importStar(require("../controllers/booking.controller"));
const reviewController = __importStar(require("../controllers/review.controller"));
const expertiseController = __importStar(require("../controllers/expertise.controller"));
const package_controller_1 = require("../controllers/package.controller");
// Permission check helper (inline for now)
const requirePermission = (permission) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // TODO: Implement actual permission check
        next();
    };
};
const router = (0, express_1.Router)();
// ============================================
// CONSULTANT MANAGEMENT
// ============================================
// Public routes - Browse consultants
// Public routes - Browse consultants
router.get('/consultants', consultantController.listConsultants);
// Public route - Get instructors (consultants who teach courses)
router.get('/instructors', consultantController.getInstructors);
// Protected routes - Manage own profile (Must be before /:id)
router.get('/consultants/profile/me', auth_middleware_1.authenticate, consultantController.getOwnProfile);
// Availability management (Must be before /:id)
router.get('/consultants/availability', auth_middleware_1.authenticate, consultantController.getOwnAvailability);
router.post('/consultants/availability', auth_middleware_1.authenticate, requirePermission('consultation.consultant.update'), consultantController.addAvailability);
router.delete('/consultants/availability/:id', auth_middleware_1.authenticate, requirePermission('consultation.consultant.update'), consultantController.removeAvailability);
// Specific ID routes (Must be last)
router.get('/consultants/:id', consultantController.getConsultant);
router.get('/consultants/:consultantId/slots', bookingController.getAvailableSlots);
router.get('/consultants/:consultantId/packages', package_controller_1.packageController.getConsultantPackages);
// ============================================
// PACKAGE MANAGEMENT
// ============================================
// Get own packages (authenticated consultant)
router.get('/packages', auth_middleware_1.authenticate, package_controller_1.packageController.getOwnPackages);
// Create package
router.post('/packages', auth_middleware_1.authenticate, requirePermission('consultation.consultant.update'), package_controller_1.packageController.createPackage);
// Reorder packages (must be before :id route)
router.put('/packages/reorder', auth_middleware_1.authenticate, requirePermission('consultation.consultant.update'), package_controller_1.packageController.reorderPackages);
// Update package
router.put('/packages/:id', auth_middleware_1.authenticate, requirePermission('consultation.consultant.update'), package_controller_1.packageController.updatePackage);
// Delete package
router.delete('/packages/:id', auth_middleware_1.authenticate, requirePermission('consultation.consultant.update'), package_controller_1.packageController.deletePackage);
// Profile Management Actions
router.patch('/consultants/profile', auth_middleware_1.authenticate, requirePermission('consultation.consultant.update'), consultantController.updateProfile);
router.post('/consultants/profile', auth_middleware_1.authenticate, requirePermission('consultation.consultant.create'), consultantController.createProfile);
// ============================================
// BOOKING SYSTEM
// ============================================
// Client - Create and manage requests
router.post('/requests', auth_middleware_1.authenticate, requirePermission('consultation.booking.create'), bookingController.createRequest);
router.get('/requests', auth_middleware_1.authenticate, bookingController.getOwnRequests);
router.get('/requests/:id', auth_middleware_1.authenticate, bookingController.getRequestDetails);
// Consultant - Respond to requests
router.patch('/requests/:id/accept', auth_middleware_1.authenticate, requirePermission('consultation.consultant.respond'), bookingController.acceptRequest);
router.post('/requests/:id/reject', auth_middleware_1.authenticate, // Assuming requireAuth() is a typo and authenticate should be used
requirePermission('consultation.booking.update'), bookingController.rejectRequest);
// Complete session (Consultant only)
router.post('/requests/:id/complete', auth_middleware_1.authenticate, // Assuming requireAuth() is a typo and authenticate should be used
requirePermission('consultation.booking.update'), bookingController.completeSession);
router.patch('/requests/:id/meeting-link', auth_middleware_1.authenticate, requirePermission('consultation.consultant.update'), bookingController.updateMeetingLink);
// Archive/Unarchive routes
router.post('/requests/:id/archive', auth_middleware_1.authenticate, bookingController.archiveRequest);
router.post('/requests/:id/unarchive', auth_middleware_1.authenticate, bookingController.unarchiveRequest);
// ============================================
// CHAT SYSTEM
// ============================================
const chatController = __importStar(require("../controllers/chat.controller"));
// Get chat details (Channel + Messages + Status)
router.get('/requests/:requestId/chat', auth_middleware_1.authenticate, chatController.getChatDetails);
// Send message
router.post('/requests/:requestId/chat/messages', auth_middleware_1.authenticate, chatController.sendMessage);
// Mark as read
router.put('/requests/:requestId/chat/read', auth_middleware_1.authenticate, chatController.markAsRead);
//   authenticate,
//   upload.single('file'),
//   chatController.uploadFile
// );
// ============================================
// ADMIN ROUTES
// ============================================
// ============================================
// PAYMENT & NOTES
// ============================================
router.post('/requests/:id/pay', auth_middleware_1.authenticate, bookingController.payRequest);
router.patch('/requests/:id/notes', auth_middleware_1.authenticate, requirePermission('consultation.consultant.update'), bookingController.updateSessionNotes);
// ============================================
// FILE MANAGEMENT
// ============================================
const fileController = __importStar(require("../controllers/file.controller"));
router.post('/requests/:id/files', auth_middleware_1.authenticate, requirePermission('consultation.consultant.update'), fileController.uploadFileHandler);
router.get('/requests/:id/files', auth_middleware_1.authenticate, fileController.getFiles);
router.delete('/files/:fileId', auth_middleware_1.authenticate, requirePermission('consultation.consultant.update'), fileController.deleteFile);
// ============================================
// ADMIN ROUTES
// ============================================
// Admin Statistics & Analytics
const adminController = __importStar(require("../controllers/admin.controller"));
router.get('/admin/stats/overview', auth_middleware_1.authenticate, requirePermission('consultation.admin.view_dashboard'), adminController.getStatsOverview);
router.get('/admin/analytics/trends', auth_middleware_1.authenticate, requirePermission('consultation.admin.view_dashboard'), adminController.getAnalyticsTrends);
router.get('/admin/analytics/top-consultants', auth_middleware_1.authenticate, requirePermission('consultation.admin.view_dashboard'), adminController.getTopConsultants);
router.get('/admin/analytics/expertise-distribution', auth_middleware_1.authenticate, requirePermission('consultation.admin.view_dashboard'), adminController.getExpertiseDistribution);
router.get('/admin/activities/recent', auth_middleware_1.authenticate, requirePermission('consultation.admin.view_dashboard'), adminController.getRecentActivities);
router.get('/admin/requests', auth_middleware_1.authenticate, requirePermission('consultation.admin.view_requests'), adminController.getAllRequests);
// Active Consultant Management
const consultantAdminController = __importStar(require("../controllers/consultant-admin.controller"));
router.get('/admin/consultants/active', auth_middleware_1.authenticate, requirePermission('consultation.admin.view_consultants'), consultantAdminController.getActiveConsultants);
router.get('/admin/consultants/:id/performance', auth_middleware_1.authenticate, requirePermission('consultation.admin.view_consultants'), consultantAdminController.getConsultantPerformance);
router.patch('/admin/consultants/:id/status', auth_middleware_1.authenticate, requirePermission('consultation.admin.manage_consultants'), consultantAdminController.updateConsultantStatus);
// Reports & Analytics
const reportsController = __importStar(require("../controllers/reports.controller"));
router.get('/admin/revenue/summary', auth_middleware_1.authenticate, requirePermission('consultation.admin.view_reports'), reportsController.getRevenueSummary);
router.get('/admin/revenue/trends', auth_middleware_1.authenticate, requirePermission('consultation.admin.view_reports'), reportsController.getRevenueTrends);
router.get('/admin/kpi', auth_middleware_1.authenticate, requirePermission('consultation.admin.view_reports'), reportsController.getKPIMetrics);
router.post('/admin/reports/export', auth_middleware_1.authenticate, requirePermission('consultation.admin.export_reports'), reportsController.exportReport);
// Consultant Approval
router.patch('/admin/consultants/:id/approve', auth_middleware_1.authenticate, requirePermission('consultation.admin.approve'), consultantController.approveConsultant);
router.patch('/admin/consultants/:id/reject', auth_middleware_1.authenticate, requirePermission('consultation.admin.approve'), consultantController.rejectConsultant);
// Admin Chat Monitoring (Temporarily disabled)
// router.get('/admin/chat/channels',
//     authenticate,
//     requirePermission('consultation.admin.view_chats'),
//     chatController.getAdminChannels
// );
// router.get('/admin/chat/:channelId/messages',
//     authenticate,
//     requirePermission('consultation.admin.view_chats'),
//     chatController.getAdminChatHistory
// );
// ============================================
// REVIEWS
// ============================================
// Get reviews for a consultant (public)
router.get('/reviews/:consultantId', reviewController.getReviews);
// Check if user can review (authenticated)
router.get('/reviews/:consultantId/can-review', auth_middleware_1.authenticate, reviewController.canReview);
// Create a review (authenticated)
router.post('/reviews', auth_middleware_1.authenticate, reviewController.createReview);
// Delete (unpublish) a review (authenticated)
router.delete('/reviews/:reviewId', auth_middleware_1.authenticate, reviewController.deleteReview);
// ============================================
// EXPERTISE MANAGEMENT
// ============================================
// Public - Get active expertise categories
router.get('/expertise/active', expertiseController.getActiveExpertise);
// Admin - Manage expertise categories
router.get('/admin/expertise', auth_middleware_1.authenticate, requirePermission('consultation.expertise.read'), expertiseController.listExpertise);
router.post('/admin/expertise', auth_middleware_1.authenticate, requirePermission('consultation.expertise.create'), expertiseController.createExpertise);
router.get('/admin/expertise/:id', auth_middleware_1.authenticate, requirePermission('consultation.expertise.read'), expertiseController.getExpertise);
router.patch('/admin/expertise/:id', auth_middleware_1.authenticate, requirePermission('consultation.expertise.update'), expertiseController.updateExpertise);
router.delete('/admin/expertise/:id', auth_middleware_1.authenticate, requirePermission('consultation.expertise.delete'), expertiseController.deleteExpertise);
router.post('/admin/expertise/:id/restore', auth_middleware_1.authenticate, requirePermission('consultation.expertise.update'), expertiseController.restoreExpertise);
router.get('/admin/expertise/:id/consultants', auth_middleware_1.authenticate, requirePermission('consultation.expertise.read'), expertiseController.getExpertiseConsultants);
router.post('/admin/expertise/:id/migrate/:targetId', auth_middleware_1.authenticate, requirePermission('consultation.expertise.delete'), expertiseController.migrateConsultants);
exports.default = router;
