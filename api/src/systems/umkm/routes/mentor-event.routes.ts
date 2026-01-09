import { Router } from 'express';
import { MentorEventController } from '../controllers/mentor-event.controller';
import { authenticate, authorize } from '../../middlewares/auth.middleware';

const router = Router();
const mentorEventController = new MentorEventController();

// ========================================
// PUBLIC ROUTES
// ========================================

// List events (public)
router.get('/', (req, res) => mentorEventController.getEvents(req, res));

// Get event by ID or slug (public)
router.get('/:id', (req, res) => mentorEventController.getEvent(req, res));

// ========================================
// MENTOR ROUTES
// ========================================

// Create event (mentor only)
router.post(
    '/',
    authenticate,
    authorize(['mentor', 'admin']),
    (req, res) => mentorEventController.createEvent(req, res)
);

// Update event (mentor only)
router.put(
    '/:id',
    authenticate,
    authorize(['mentor', 'admin']),
    (req, res) => mentorEventController.updateEvent(req, res)
);

// Delete event (mentor only)
router.delete(
    '/:id',
    authenticate,
    authorize(['mentor', 'admin']),
    (req, res) => mentorEventController.deleteEvent(req, res)
);

// Confirm attendee (mentor only)
router.post(
    '/:id/confirm',
    authenticate,
    authorize(['mentor', 'admin']),
    (req, res) => mentorEventController.confirmAttendance(req, res)
);

// Mark attendee as attended (mentor only)
router.post(
    '/:id/mark-attended',
    authenticate,
    authorize(['mentor', 'admin']),
    (req, res) => mentorEventController.markAttended(req, res)
);

// Get UMKM by mentor (for mapping)
router.get(
    '/mentors/:mentorId/umkm',
    authenticate,
    (req, res) => mentorEventController.getUMKMByMentor(req, res)
);

// Get UMKM map data by mentor
router.get(
    '/mentors/:mentorId/umkm/map',
    authenticate,
    (req, res) => mentorEventController.getUMKMMapData(req, res)
);

// ========================================
// UMKM ROUTES
// ========================================

// Get events for UMKM (authenticated)
router.get(
    '/umkm/available',
    authenticate,
    (req, res) => mentorEventController.getEventsForUMKM(req, res)
);

// Get my registrations (authenticated UMKM)
router.get(
    '/umkm/my-registrations',
    authenticate,
    (req, res) => mentorEventController.getMyRegistrations(req, res)
);

// RSVP to event (authenticated UMKM)
router.post(
    '/:id/attend',
    authenticate,
    (req, res) => mentorEventController.attendEvent(req, res)
);

// Cancel attendance (authenticated UMKM)
router.delete(
    '/:id/attend',
    authenticate,
    (req, res) => mentorEventController.cancelAttendance(req, res)
);

export default router;
