import { prisma } from '../../../lib/prisma';
import { Prisma } from '../../../../prisma/generated/client';
import { NotificationService } from '../../notification/services/notification.service';

const notificationService = new NotificationService();

interface CreateEventDto {
    title: string;
    description: string;
    thumbnail?: string;
    province: string;
    city: string;
    venue?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    startDate: Date;
    endDate: Date;
    maxAttendees?: number;
    registrationEnd?: Date;
    type?: 'workshop' | 'gathering' | 'training';
    tags?: string[];
}

interface EventQueryDto {
    mentorId?: string;
    province?: string;
    city?: string;
    status?: string;
    type?: string;
    upcoming?: boolean;
    skip?: number;
    limit?: number;
}

function generateSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
        + '-' + Date.now().toString(36);
}

export class MentorEventService {
    // Create new mentor event
    async createEvent(mentorId: string, data: CreateEventDto) {
        const slug = generateSlug(data.title);

        return prisma.mentorEvent.create({
            data: {
                ...data,
                slug,
                mentorId,
                latitude: data.latitude ? new Prisma.Decimal(data.latitude) : null,
                longitude: data.longitude ? new Prisma.Decimal(data.longitude) : null,
            },
            include: {
                mentor: {
                    include: {
                        user: {
                            select: { fullName: true, email: true },
                        },
                    },
                },
                _count: { select: { attendees: true } },
            },
        });
    }

    // List events with filters
    async getEvents(query: EventQueryDto) {
        const where: Prisma.MentorEventWhereInput = {};

        if (query.mentorId) where.mentorId = query.mentorId;
        if (query.province) where.province = query.province;
        if (query.city) where.city = query.city;
        if (query.status) where.status = query.status;
        if (query.type) where.type = query.type;
        if (query.upcoming) where.startDate = { gte: new Date() };

        const [events, total] = await Promise.all([
            prisma.mentorEvent.findMany({
                where,
                include: {
                    mentor: {
                        include: {
                            user: { select: { fullName: true } },
                        },
                    },
                    _count: { select: { attendees: true } },
                },
                orderBy: { startDate: 'asc' },
                skip: query.skip || 0,
                take: query.limit || 20,
            }),
            prisma.mentorEvent.count({ where }),
        ]);

        return { events, total };
    }

    // Get event by ID or slug
    async getEvent(idOrSlug: string) {
        return prisma.mentorEvent.findFirst({
            where: {
                OR: [{ id: idOrSlug }, { slug: idOrSlug }],
            },
            include: {
                mentor: {
                    include: {
                        user: {
                            select: { id: true, fullName: true, email: true },
                        },
                    },
                },
                attendees: {
                    include: {
                        umkmProfile: {
                            select: {
                                id: true,
                                businessName: true,
                                ownerName: true,
                                city: true,
                            },
                        },
                    },
                    orderBy: { registeredAt: 'desc' },
                },
                _count: { select: { attendees: true } },
            },
        });
    }

    // Update event
    async updateEvent(id: string, mentorId: string, data: Partial<CreateEventDto> & { status?: string }) {
        // Verify ownership
        const event = await prisma.mentorEvent.findFirst({
            where: { id, mentorId },
        });

        if (!event) {
            throw new Error('Event not found or unauthorized');
        }

        return prisma.mentorEvent.update({
            where: { id },
            data: {
                ...data,
                latitude: data.latitude !== undefined ? new Prisma.Decimal(data.latitude) : undefined,
                longitude: data.longitude !== undefined ? new Prisma.Decimal(data.longitude) : undefined,
            },
            include: {
                mentor: {
                    include: {
                        user: { select: { fullName: true } },
                    },
                },
                _count: { select: { attendees: true } },
            },
        });
    }

    // Delete event
    async deleteEvent(id: string, mentorId: string) {
        // Verify ownership
        const event = await prisma.mentorEvent.findFirst({
            where: { id, mentorId },
        });

        if (!event) {
            throw new Error('Event not found or unauthorized');
        }

        return prisma.mentorEvent.delete({ where: { id } });
    }

    // RSVP to event
    async attendEvent(eventId: string, umkmProfileId: string) {
        const event = await prisma.mentorEvent.findUnique({
            where: { id: eventId },
            include: { _count: { select: { attendees: true } } },
        });

        if (!event) throw new Error('Event not found');
        if (event.status !== 'published') throw new Error('Event is not open for registration');
        if (event._count.attendees >= event.maxAttendees) throw new Error('Event is full');
        if (event.registrationEnd && new Date() > event.registrationEnd) {
            throw new Error('Registration has closed');
        }

        const result = await prisma.mentorEventAttendee.upsert({
            where: {
                eventId_umkmProfileId: { eventId, umkmProfileId },
            },
            create: { eventId, umkmProfileId, status: 'registered' },
            update: { status: 'registered', cancelledAt: null },
            include: {
                event: { select: { title: true, startDate: true } },
            },
        });

        // Send confirmation email asynchronously
        try {
            const umkmUser = await prisma.uMKMProfile.findUnique({
                where: { id: umkmProfileId },
                include: { user: { select: { email: true } } }
            });

            if (umkmUser?.user.email) {
                notificationService.sendRegistrationConfirmation(
                    umkmUser.user.email,
                    event.title
                ).catch(err => console.error('Failed to send confirmation email:', err));
            }
        } catch (error) {
            console.error('Error fetching user for notification:', error);
        }

        return result;
    }

    // Cancel attendance
    async cancelAttendance(eventId: string, umkmProfileId: string) {
        return prisma.mentorEventAttendee.update({
            where: {
                eventId_umkmProfileId: { eventId, umkmProfileId },
            },
            data: { status: 'cancelled', cancelledAt: new Date() },
        });
    }

    // Confirm attendance (by mentor)
    async confirmAttendance(eventId: string, umkmProfileId: string, mentorId: string) {
        // Verify mentor owns the event
        const event = await prisma.mentorEvent.findFirst({
            where: { id: eventId, mentorId },
        });

        if (!event) throw new Error('Event not found or unauthorized');

        return prisma.mentorEventAttendee.update({
            where: {
                eventId_umkmProfileId: { eventId, umkmProfileId },
            },
            data: { status: 'confirmed', confirmedAt: new Date() },
        });
    }

    // Mark attendance (by mentor - after event)
    async markAttended(eventId: string, umkmProfileId: string, mentorId: string) {
        // Verify mentor owns the event
        const event = await prisma.mentorEvent.findFirst({
            where: { id: eventId, mentorId },
        });

        if (!event) throw new Error('Event not found or unauthorized');

        return prisma.mentorEventAttendee.update({
            where: {
                eventId_umkmProfileId: { eventId, umkmProfileId },
            },
            data: { status: 'attended', attendedAt: new Date() },
        });
    }

    // Get UMKM by mentor (for mapping)
    async getUMKMByMentor(mentorId: string, query: { province?: string; city?: string }) {
        const where: Prisma.UMKMProfileWhereInput = {
            mentoringSessions: {
                some: { mentorId },
            },
        };

        if (query.province) where.province = query.province;
        if (query.city) where.city = query.city;

        return prisma.uMKMProfile.findMany({
            where,
            include: {
                user: { select: { fullName: true, email: true } },
                mentoringSessions: {
                    where: { mentorId },
                    orderBy: { date: 'desc' },
                    take: 1,
                    select: {
                        date: true,
                        topic: true,
                        status: true,
                    },
                },
            },
            orderBy: { businessName: 'asc' },
        });
    }

    // Get map data for mentor's UMKM
    async getUMKMMapData(mentorId: string) {
        const umkmList = await this.getUMKMByMentor(mentorId, {});

        // Group by province/city for statistics
        const regionStats = umkmList.reduce(
            (acc, umkm) => {
                const key = `${umkm.province}-${umkm.city}`;
                if (!acc[key]) {
                    acc[key] = {
                        province: umkm.province,
                        city: umkm.city,
                        count: 0,
                        umkmIds: [] as string[],
                    };
                }
                acc[key].count++;
                acc[key].umkmIds.push(umkm.id);
                return acc;
            },
            {} as Record<string, { province: string | null; city: string | null; count: number; umkmIds: string[] }>
        );

        // Parse location JSON field
        const markersWithLocation = umkmList
            .filter((u) => {
                const location = u.location as { lat?: number; lng?: number } | null;
                return location && location.lat && location.lng;
            })
            .map((u) => {
                const location = u.location as { lat: number; lng: number };
                return {
                    id: u.id,
                    name: u.businessName,
                    lat: location.lat,
                    lng: location.lng,
                    segmentation: u.segmentation,
                    city: u.city,
                };
            });

        return {
            total: umkmList.length,
            byRegion: Object.values(regionStats),
            markers: markersWithLocation,
        };
    }

    // Get events for a specific UMKM
    async getEventsForUMKM(umkmProfileId: string, query: { province?: string; city?: string; upcoming?: boolean }) {
        const umkm = await prisma.uMKMProfile.findUnique({
            where: { id: umkmProfileId },
            select: { province: true, city: true },
        });

        if (!umkm) throw new Error('UMKM profile not found');

        const where: Prisma.MentorEventWhereInput = {
            status: 'published',
        };

        // Filter by UMKM's location if no specific filter
        if (query.province) {
            where.province = query.province;
        } else if (umkm.province) {
            where.province = umkm.province;
        }

        if (query.city) {
            where.city = query.city;
        }

        if (query.upcoming) {
            where.startDate = { gte: new Date() };
        }

        return prisma.mentorEvent.findMany({
            where,
            include: {
                mentor: {
                    include: {
                        user: { select: { fullName: true } },
                    },
                },
                _count: { select: { attendees: true } },
                attendees: {
                    where: { umkmProfileId },
                    select: { status: true },
                },
            },
            orderBy: { startDate: 'asc' },
        });
    }

    // Get my registrations (for UMKM)
    async getMyRegistrations(umkmProfileId: string) {
        return prisma.mentorEventAttendee.findMany({
            where: { umkmProfileId },
            include: {
                event: {
                    include: {
                        mentor: {
                            include: {
                                user: { select: { fullName: true } },
                            },
                        },
                    },
                },
            },
            orderBy: { registeredAt: 'desc' },
        });
    }
}
