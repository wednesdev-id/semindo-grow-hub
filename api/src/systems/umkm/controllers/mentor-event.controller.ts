import { Request, Response } from 'express';
import { MentorEventService } from '../services/mentor-event.service';
import { z } from 'zod';

const mentorEventService = new MentorEventService();

const createEventSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    description: z.string().min(20, 'Description must be at least 20 characters'),
    thumbnail: z.string().url().optional(),
    province: z.string().min(1, 'Province is required'),
    city: z.string().min(1, 'City is required'),
    venue: z.string().optional(),
    address: z.string().optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    startDate: z.string().datetime(),
    endDate: z.string().datetime(),
    maxAttendees: z.number().min(1).default(50),
    registrationEnd: z.string().datetime().optional(),
    type: z.enum(['workshop', 'gathering', 'training']).default('workshop'),
    tags: z.array(z.string()).optional(),
});

const updateEventSchema = createEventSchema.partial().extend({
    status: z.enum(['draft', 'published', 'cancelled', 'completed']).optional(),
});

export class MentorEventController {
    // Create new event
    async createEvent(req: Request, res: Response) {
        try {
            const mentorProfile = (req as any).user?.mentorProfile;
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
        } catch (error) {
            if (error instanceof z.ZodError) {
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
    async getEvents(req: Request, res: Response) {
        try {
            const result = await mentorEventService.getEvents({
                mentorId: req.query.mentorId as string,
                province: req.query.province as string,
                city: req.query.city as string,
                status: req.query.status as string,
                type: req.query.type as string,
                upcoming: req.query.upcoming === 'true',
                skip: parseInt(req.query.skip as string) || 0,
                limit: parseInt(req.query.limit as string) || 20,
            });

            res.json({
                success: true,
                data: result.events,
                meta: {
                    total: result.total,
                    skip: parseInt(req.query.skip as string) || 0,
                    limit: parseInt(req.query.limit as string) || 20,
                },
            });
        } catch (error) {
            console.error('Get events error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch events',
            });
        }
    }

    // Get event by ID or slug
    async getEvent(req: Request, res: Response) {
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
        } catch (error) {
            console.error('Get event error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch event',
            });
        }
    }

    // Update event
    async updateEvent(req: Request, res: Response) {
        try {
            const mentorProfile = (req as any).user?.mentorProfile;
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
        } catch (error: any) {
            if (error instanceof z.ZodError) {
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
    async deleteEvent(req: Request, res: Response) {
        try {
            const mentorProfile = (req as any).user?.mentorProfile;
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
        } catch (error: any) {
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
    async attendEvent(req: Request, res: Response) {
        try {
            const umkmProfiles = (req as any).user?.umkmProfiles;
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
        } catch (error: any) {
            res.status(400).json({
                success: false,
                error: error.message,
            });
        }
    }

    // Cancel attendance
    async cancelAttendance(req: Request, res: Response) {
        try {
            const umkmProfiles = (req as any).user?.umkmProfiles;
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
        } catch (error) {
            console.error('Cancel attendance error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to cancel attendance',
            });
        }
    }

    // Confirm attendance (by mentor)
    async confirmAttendance(req: Request, res: Response) {
        try {
            const mentorProfile = (req as any).user?.mentorProfile;
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

            const attendance = await mentorEventService.confirmAttendance(
                req.params.id,
                umkmProfileId,
                mentorProfile.id
            );

            res.json({
                success: true,
                data: attendance,
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                error: error.message,
            });
        }
    }

    // Mark as attended (by mentor - after event)
    async markAttended(req: Request, res: Response) {
        try {
            const mentorProfile = (req as any).user?.mentorProfile;
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

            const attendance = await mentorEventService.markAttended(
                req.params.id,
                umkmProfileId,
                mentorProfile.id
            );

            res.json({
                success: true,
                data: attendance,
            });
        } catch (error: any) {
            res.status(400).json({
                success: false,
                error: error.message,
            });
        }
    }

    // Get UMKM by mentor
    async getUMKMByMentor(req: Request, res: Response) {
        try {
            const mentorId = req.params.mentorId;
            const umkmList = await mentorEventService.getUMKMByMentor(mentorId, {
                province: req.query.province as string,
                city: req.query.city as string,
            });

            res.json({
                success: true,
                data: umkmList,
                meta: { total: umkmList.length },
            });
        } catch (error) {
            console.error('Get UMKM by mentor error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch UMKM data',
            });
        }
    }

    // Get UMKM map data
    async getUMKMMapData(req: Request, res: Response) {
        try {
            const mentorId = req.params.mentorId;
            const mapData = await mentorEventService.getUMKMMapData(mentorId);

            res.json({
                success: true,
                data: mapData,
            });
        } catch (error) {
            console.error('Get UMKM map data error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch map data',
            });
        }
    }

    // Get events for UMKM
    async getEventsForUMKM(req: Request, res: Response) {
        try {
            const umkmProfiles = (req as any).user?.umkmProfiles;
            const umkmProfile = umkmProfiles?.[0];

            if (!umkmProfile) {
                return res.status(403).json({
                    success: false,
                    error: 'UMKM profile required',
                    redirect: '/onboarding/business',
                });
            }

            const events = await mentorEventService.getEventsForUMKM(umkmProfile.id, {
                province: req.query.province as string,
                city: req.query.city as string,
                upcoming: req.query.upcoming === 'true',
            });

            res.json({
                success: true,
                data: events,
            });
        } catch (error: any) {
            res.status(500).json({
                success: false,
                error: error.message || 'Failed to fetch events',
            });
        }
    }

    // Get my registrations
    async getMyRegistrations(req: Request, res: Response) {
        try {
            const umkmProfiles = (req as any).user?.umkmProfiles;
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
        } catch (error) {
            console.error('Get my registrations error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch registrations',
            });
        }
    }
}
