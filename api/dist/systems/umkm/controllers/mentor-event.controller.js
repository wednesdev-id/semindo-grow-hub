"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MentorEventController = void 0;
const mentor_event_service_1 = require("../services/mentor-event.service");
const zod_1 = require("zod");
const mentorEventService = new mentor_event_service_1.MentorEventService();
const createEventSchema = zod_1.z.object({
    title: zod_1.z.string().min(5, 'Title must be at least 5 characters'),
    description: zod_1.z.string().min(20, 'Description must be at least 20 characters'),
    thumbnail: zod_1.z.string().url().optional(),
    province: zod_1.z.string().min(1, 'Province is required'),
    city: zod_1.z.string().min(1, 'City is required'),
    venue: zod_1.z.string().optional(),
    address: zod_1.z.string().optional(),
    latitude: zod_1.z.number().min(-90).max(90).optional(),
    longitude: zod_1.z.number().min(-180).max(180).optional(),
    startDate: zod_1.z.string().datetime(),
    endDate: zod_1.z.string().datetime(),
    maxAttendees: zod_1.z.number().min(1).default(50),
    registrationEnd: zod_1.z.string().datetime().optional(),
    type: zod_1.z.enum(['workshop', 'gathering', 'training']).default('workshop'),
    tags: zod_1.z.array(zod_1.z.string()).optional(),
});
const updateEventSchema = createEventSchema.partial().extend({
    status: zod_1.z.enum(['draft', 'published', 'cancelled', 'completed']).optional(),
});
class MentorEventController {
    // Create new event
    async createEvent(req, res) {
        try {
            const mentorProfile = req.user?.mentorProfile;
            if (!mentorProfile) {
                return res.status(403).json({
                    success: false,
                    error: 'Only mentors can create events',
                });
            }
            const data = createEventSchema.parse(req.body);
            const event = await mentorEventService.createEvent(mentorProfile.id, {
                ...data,
                startDate: new Date(data.startDate),
                endDate: new Date(data.endDate),
                registrationEnd: data.registrationEnd ? new Date(data.registrationEnd) : undefined,
            });
            res.status(201).json({
                success: true,
                data: event,
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation error',
                    details: error.issues,
                });
            }
            console.error('Create event error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create event',
            });
        }
    }
    // List events
    async getEvents(req, res) {
        try {
            const result = await mentorEventService.getEvents({
                mentorId: req.query.mentorId,
                province: req.query.province,
                city: req.query.city,
                status: req.query.status,
                type: req.query.type,
                upcoming: req.query.upcoming === 'true',
                skip: parseInt(req.query.skip) || 0,
                limit: parseInt(req.query.limit) || 20,
            });
            res.json({
                success: true,
                data: result.events,
                meta: {
                    total: result.total,
                    skip: parseInt(req.query.skip) || 0,
                    limit: parseInt(req.query.limit) || 20,
                },
            });
        }
        catch (error) {
            console.error('Get events error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch events',
            });
        }
    }
    // Get event by ID or slug
    async getEvent(req, res) {
        try {
            const event = await mentorEventService.getEvent(req.params.id);
            if (!event) {
                return res.status(404).json({
                    success: false,
                    error: 'Event not found',
                });
            }
            res.json({
                success: true,
                data: event,
            });
        }
        catch (error) {
            console.error('Get event error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch event',
            });
        }
    }
    // Update event
    async updateEvent(req, res) {
        try {
            const mentorProfile = req.user?.mentorProfile;
            if (!mentorProfile) {
                return res.status(403).json({
                    success: false,
                    error: 'Unauthorized',
                });
            }
            const data = updateEventSchema.parse(req.body);
            const event = await mentorEventService.updateEvent(req.params.id, mentorProfile.id, {
                ...data,
                startDate: data.startDate ? new Date(data.startDate) : undefined,
                endDate: data.endDate ? new Date(data.endDate) : undefined,
                registrationEnd: data.registrationEnd ? new Date(data.registrationEnd) : undefined,
            });
            res.json({
                success: true,
                data: event,
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    success: false,
                    error: 'Validation error',
                    details: error.issues,
                });
            }
            if (error.message === 'Event not found or unauthorized') {
                return res.status(404).json({
                    success: false,
                    error: error.message,
                });
            }
            console.error('Update event error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update event',
            });
        }
    }
    // Delete event
    async deleteEvent(req, res) {
        try {
            const mentorProfile = req.user?.mentorProfile;
            if (!mentorProfile) {
                return res.status(403).json({
                    success: false,
                    error: 'Unauthorized',
                });
            }
            await mentorEventService.deleteEvent(req.params.id, mentorProfile.id);
            res.json({
                success: true,
                message: 'Event deleted successfully',
            });
        }
        catch (error) {
            if (error.message === 'Event not found or unauthorized') {
                return res.status(404).json({
                    success: false,
                    error: error.message,
                });
            }
            console.error('Delete event error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete event',
            });
        }
    }
    // RSVP to event
    async attendEvent(req, res) {
        try {
            const umkmProfiles = req.user?.umkmProfiles;
            const umkmProfile = umkmProfiles?.[0];
            if (!umkmProfile) {
                return res.status(403).json({
                    success: false,
                    error: 'Only registered UMKM can attend events',
                    redirect: '/onboarding/business',
                    requiresUMKM: true,
                });
            }
            // Check if UMKM profile is at least submitted (not draft)
            if (umkmProfile.status === 'draft' || umkmProfile.status === 'unverified') {
                return res.status(403).json({
                    success: false,
                    error: 'Please complete your business registration first',
                    redirect: '/onboarding/business',
                    requiresUMKM: true,
                });
            }
            const attendance = await mentorEventService.attendEvent(req.params.id, umkmProfile.id);
            res.status(201).json({
                success: true,
                data: attendance,
                message: 'Successfully registered for the event',
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                error: error.message,
            });
        }
    }
    // Cancel attendance
    async cancelAttendance(req, res) {
        try {
            const umkmProfiles = req.user?.umkmProfiles;
            const umkmProfile = umkmProfiles?.[0];
            if (!umkmProfile) {
                return res.status(403).json({
                    success: false,
                    error: 'Unauthorized',
                });
            }
            await mentorEventService.cancelAttendance(req.params.id, umkmProfile.id);
            res.json({
                success: true,
                message: 'Attendance cancelled',
            });
        }
        catch (error) {
            console.error('Cancel attendance error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to cancel attendance',
            });
        }
    }
    // Confirm attendance (by mentor)
    async confirmAttendance(req, res) {
        try {
            const mentorProfile = req.user?.mentorProfile;
            if (!mentorProfile) {
                return res.status(403).json({
                    success: false,
                    error: 'Unauthorized',
                });
            }
            const { umkmProfileId } = req.body;
            if (!umkmProfileId) {
                return res.status(400).json({
                    success: false,
                    error: 'umkmProfileId is required',
                });
            }
            const attendance = await mentorEventService.confirmAttendance(req.params.id, umkmProfileId, mentorProfile.id);
            res.json({
                success: true,
                data: attendance,
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                error: error.message,
            });
        }
    }
    // Mark as attended (by mentor - after event)
    async markAttended(req, res) {
        try {
            const mentorProfile = req.user?.mentorProfile;
            if (!mentorProfile) {
                return res.status(403).json({
                    success: false,
                    error: 'Unauthorized',
                });
            }
            const { umkmProfileId } = req.body;
            if (!umkmProfileId) {
                return res.status(400).json({
                    success: false,
                    error: 'umkmProfileId is required',
                });
            }
            const attendance = await mentorEventService.markAttended(req.params.id, umkmProfileId, mentorProfile.id);
            res.json({
                success: true,
                data: attendance,
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                error: error.message,
            });
        }
    }
    // Get UMKM by mentor
    async getUMKMByMentor(req, res) {
        try {
            const mentorId = req.params.mentorId;
            const umkmList = await mentorEventService.getUMKMByMentor(mentorId, {
                province: req.query.province,
                city: req.query.city,
            });
            res.json({
                success: true,
                data: umkmList,
                meta: { total: umkmList.length },
            });
        }
        catch (error) {
            console.error('Get UMKM by mentor error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch UMKM data',
            });
        }
    }
    // Get UMKM map data
    async getUMKMMapData(req, res) {
        try {
            const mentorId = req.params.mentorId;
            const mapData = await mentorEventService.getUMKMMapData(mentorId);
            res.json({
                success: true,
                data: mapData,
            });
        }
        catch (error) {
            console.error('Get UMKM map data error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch map data',
            });
        }
    }
    // Get events for UMKM
    async getEventsForUMKM(req, res) {
        try {
            const umkmProfiles = req.user?.umkmProfiles;
            const umkmProfile = umkmProfiles?.[0];
            if (!umkmProfile) {
                return res.status(403).json({
                    success: false,
                    error: 'UMKM profile required',
                    redirect: '/onboarding/business',
                });
            }
            const events = await mentorEventService.getEventsForUMKM(umkmProfile.id, {
                province: req.query.province,
                city: req.query.city,
                upcoming: req.query.upcoming === 'true',
            });
            res.json({
                success: true,
                data: events,
            });
        }
        catch (error) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to fetch events',
            });
        }
    }
    // Get my registrations
    async getMyRegistrations(req, res) {
        try {
            const umkmProfiles = req.user?.umkmProfiles;
            const umkmProfile = umkmProfiles?.[0];
            if (!umkmProfile) {
                return res.status(403).json({
                    success: false,
                    error: 'UMKM profile required',
                });
            }
            const registrations = await mentorEventService.getMyRegistrations(umkmProfile.id);
            res.json({
                success: true,
                data: registrations,
            });
        }
        catch (error) {
            console.error('Get my registrations error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch registrations',
            });
        }
    }
}
exports.MentorEventController = MentorEventController;
