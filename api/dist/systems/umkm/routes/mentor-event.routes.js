"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const mentor_event_controller_1 = require("../controllers/mentor-event.controller");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const router = (0, express_1.Router)();
const mentorEventController = new mentor_event_controller_1.MentorEventController();
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
router.post('/', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['mentor', 'admin']), (req, res) => mentorEventController.createEvent(req, res));
// Update event (mentor only)
router.put('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['mentor', 'admin']), (req, res) => mentorEventController.updateEvent(req, res));
// Delete event (mentor only)
router.delete('/:id', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['mentor', 'admin']), (req, res) => mentorEventController.deleteEvent(req, res));
// Confirm attendee (mentor only)
router.post('/:id/confirm', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['mentor', 'admin']), (req, res) => mentorEventController.confirmAttendance(req, res));
// Mark attendee as attended (mentor only)
router.post('/:id/mark-attended', auth_middleware_1.authenticate, (0, auth_middleware_1.authorize)(['mentor', 'admin']), (req, res) => mentorEventController.markAttended(req, res));
// Get UMKM by mentor (for mapping)
router.get('/mentors/:mentorId/umkm', auth_middleware_1.authenticate, (req, res) => mentorEventController.getUMKMByMentor(req, res));
// Get UMKM map data by mentor
router.get('/mentors/:mentorId/umkm/map', auth_middleware_1.authenticate, (req, res) => mentorEventController.getUMKMMapData(req, res));
// ========================================
// UMKM ROUTES
// ========================================
// Get events for UMKM (authenticated)
router.get('/umkm/available', auth_middleware_1.authenticate, (req, res) => mentorEventController.getEventsForUMKM(req, res));
// Get my registrations (authenticated UMKM)
router.get('/umkm/my-registrations', auth_middleware_1.authenticate, (req, res) => mentorEventController.getMyRegistrations(req, res));
// RSVP to event (authenticated UMKM)
router.post('/:id/attend', auth_middleware_1.authenticate, (req, res) => mentorEventController.attendEvent(req, res));
// Cancel attendance (authenticated UMKM)
router.delete('/:id/attend', auth_middleware_1.authenticate, (req, res) => mentorEventController.cancelAttendance(req, res));
exports.default = router;
