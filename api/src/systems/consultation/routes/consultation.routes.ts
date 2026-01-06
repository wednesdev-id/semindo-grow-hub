import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import * as consultantController from '../controllers/consultant.controller';
import * as bookingController from '../controllers/booking.controller';

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

export default router;
