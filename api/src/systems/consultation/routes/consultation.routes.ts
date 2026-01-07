import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import * as consultantController from '../controllers/consultant.controller';
import * as bookingController from '../controllers/booking.controller';
import * as reviewController from '../controllers/review.controller';
import * as expertiseController from '../controllers/expertise.controller';
import { packageController } from '../controllers/package.controller';

// Permission check helper (inline for now)
const requirePermission = (permission: string) => {
    return (req: any, res: any, next: any) => {
        if (!req.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        // TODO: Implement actual permission check
        next();
    };
};

const router = Router();

// ============================================
// CONSULTANT MANAGEMENT
// ============================================

// Public routes - Browse consultants
// Public routes - Browse consultants
router.get('/consultants', consultantController.listConsultants);

// Public route - Get instructors (consultants who teach courses)
router.get('/instructors', consultantController.getInstructors);


// Protected routes - Manage own profile (Must be before /:id)
router.get('/consultants/profile/me',
    authenticate,
    consultantController.getOwnProfile
);

// Availability management (Must be before /:id)
router.get('/consultants/availability',
    authenticate,
    consultantController.getOwnAvailability
);

router.post('/consultants/availability',
    authenticate,
    requirePermission('consultation.consultant.update'),
    consultantController.addAvailability
);

router.delete('/consultants/availability/:id',
    authenticate,
    requirePermission('consultation.consultant.update'),
    consultantController.removeAvailability
);

// Specific ID routes (Must be last)
router.get('/consultants/:id', consultantController.getConsultant);
router.get('/consultants/:consultantId/slots', bookingController.getAvailableSlots);
router.get('/consultants/:consultantId/packages', packageController.getConsultantPackages);

// ============================================
// PACKAGE MANAGEMENT
// ============================================

// Get own packages (authenticated consultant)
router.get('/packages',
    authenticate,
    packageController.getOwnPackages
);

// Create package
router.post('/packages',
    authenticate,
    requirePermission('consultation.consultant.update'),
    packageController.createPackage
);

// Reorder packages (must be before :id route)
router.put('/packages/reorder',
    authenticate,
    requirePermission('consultation.consultant.update'),
    packageController.reorderPackages
);

// Update package
router.put('/packages/:id',
    authenticate,
    requirePermission('consultation.consultant.update'),
    packageController.updatePackage
);

// Delete package
router.delete('/packages/:id',
    authenticate,
    requirePermission('consultation.consultant.update'),
    packageController.deletePackage
);

// Profile Management Actions
router.patch('/consultants/profile',
    authenticate,
    requirePermission('consultation.consultant.update'),
    consultantController.updateProfile
);

router.post('/consultants/profile',
    authenticate,
    requirePermission('consultation.consultant.create'),
    consultantController.createProfile
);

// ============================================
// BOOKING SYSTEM
// ============================================

// Client - Create and manage requests
router.post('/requests',
    authenticate,
    requirePermission('consultation.booking.create'),
    bookingController.createRequest
);

router.get('/requests',
    authenticate,
    bookingController.getOwnRequests
);

router.get('/requests/:id',
    authenticate,
    bookingController.getRequestDetails
);

// Consultant - Respond to requests
router.patch('/requests/:id/accept',
    authenticate,
    requirePermission('consultation.consultant.respond'),
    bookingController.acceptRequest
);

router.post(
    '/requests/:id/reject',
    authenticate, // Assuming requireAuth() is a typo and authenticate should be used
    requirePermission('consultation.booking.update'),
    bookingController.rejectRequest
);

// Complete session (Consultant only)
router.post(
    '/requests/:id/complete',
    authenticate, // Assuming requireAuth() is a typo and authenticate should be used
    requirePermission('consultation.booking.update'),
    bookingController.completeSession
);


router.patch('/requests/:id/meeting-link',
    authenticate,
    requirePermission('consultation.consultant.update'),
    bookingController.updateMeetingLink
);

// Archive/Unarchive routes
router.post('/requests/:id/archive',
    authenticate,
    bookingController.archiveRequest
);

router.post('/requests/:id/unarchive',
    authenticate,
    bookingController.unarchiveRequest
);

// ============================================
// CHAT SYSTEM
// ============================================

import * as chatController from '../controllers/chat.controller';

// Get chat channel for a request
router.get('/requests/:requestId/chat',
    authenticate,
    chatController.getOrCreateChannel
);

// Get chat history
router.get('/chat/:channelId/messages',
    authenticate,
    chatController.getChatHistory
);

// Get unread count
router.get('/chat/:channelId/unread',
    authenticate,
    chatController.getUnreadCount
);

// Upload file (requires multer middleware)
// router.post('/chat/:channelId/upload', 
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

router.post('/requests/:id/pay',
    authenticate,
    bookingController.payRequest
);

router.patch('/requests/:id/notes',
    authenticate,
    requirePermission('consultation.consultant.update'),
    bookingController.updateSessionNotes
);

// ============================================
// FILE MANAGEMENT
// ============================================

import * as fileController from '../controllers/file.controller';

router.post('/requests/:id/files',
    authenticate,
    requirePermission('consultation.consultant.update'),
    fileController.uploadFileHandler
);

router.get('/requests/:id/files',
    authenticate,
    fileController.getFiles
);

router.delete('/files/:fileId',
    authenticate,
    requirePermission('consultation.consultant.update'),
    fileController.deleteFile
);

// ============================================
// ADMIN ROUTES
// ============================================

router.patch('/admin/consultants/:id/approve',
    authenticate,
    requirePermission('consultation.admin.approve'),
    consultantController.approveConsultant
);

router.patch('/admin/consultants/:id/reject',
    authenticate,
    requirePermission('consultation.admin.approve'),
    consultantController.rejectConsultant
);

// Admin Chat Monitoring
router.get('/admin/chat/channels',
    authenticate,
    requirePermission('consultation.admin.view_chats'),
    chatController.getAdminChannels
);

router.get('/admin/chat/:channelId/messages',
    authenticate,
    requirePermission('consultation.admin.view_chats'),
    chatController.getAdminChatHistory
);

// ============================================
// REVIEWS
// ============================================

// Get reviews for a consultant (public)
router.get('/reviews/:consultantId', reviewController.getReviews);

// Check if user can review (authenticated)
router.get('/reviews/:consultantId/can-review',
    authenticate,
    reviewController.canReview
);

// Create a review (authenticated)
router.post('/reviews',
    authenticate,
    reviewController.createReview
);

// Delete (unpublish) a review (authenticated)
router.delete('/reviews/:reviewId',
    authenticate,
    reviewController.deleteReview
);

// ============================================
// EXPERTISE MANAGEMENT
// ============================================

// Public - Get active expertise categories
router.get('/expertise/active', expertiseController.getActiveExpertise);

// Admin - Manage expertise categories
router.get('/admin/expertise',
    authenticate,
    requirePermission('consultation.expertise.read'),
    expertiseController.listExpertise
);

router.post('/admin/expertise',
    authenticate,
    requirePermission('consultation.expertise.create'),
    expertiseController.createExpertise
);

router.get('/admin/expertise/:id',
    authenticate,
    requirePermission('consultation.expertise.read'),
    expertiseController.getExpertise
);

router.patch('/admin/expertise/:id',
    authenticate,
    requirePermission('consultation.expertise.update'),
    expertiseController.updateExpertise
);

router.delete('/admin/expertise/:id',
    authenticate,
    requirePermission('consultation.expertise.delete'),
    expertiseController.deleteExpertise
);

router.post('/admin/expertise/:id/restore',
    authenticate,
    requirePermission('consultation.expertise.update'),
    expertiseController.restoreExpertise
);

router.get('/admin/expertise/:id/consultants',
    authenticate,
    requirePermission('consultation.expertise.read'),
    expertiseController.getExpertiseConsultants
);

router.post('/admin/expertise/:id/migrate/:targetId',
    authenticate,
    requirePermission('consultation.expertise.delete'),
    expertiseController.migrateConsultants
);

export default router;
