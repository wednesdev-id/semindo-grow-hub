import { prisma } from '../../../lib/prisma';
import { Prisma } from "@prisma/client";

export class EventService {
    async getEvents(params: { type?: 'online' | 'offline'; search?: string; page?: number; limit?: number }) {
        const { type, search, page = 1, limit = 10 } = params;
        const skip = (page - 1) * limit;

        const where: Prisma.EventWhereInput = {};

        if (type && type !== 'all' as any) {
            where.type = type;
        }

        if (search) {
            where.title = { contains: search, mode: "insensitive" };
        }

        const [events, total] = await Promise.all([
            prisma.event.findMany({
                where,
                include: {
                    organizer: {
                        select: { id: true, fullName: true, businessName: true }
                    },
                    _count: {
                        select: { registrations: true }
                    }
                },
                orderBy: { startDate: 'asc' },
                skip,
                take: limit,
            }),
            prisma.event.count({ where })
        ]);

        return {
            data: events,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        };
    }

    async getEvent(id: string) {
        return prisma.event.findUnique({
            where: { id },
            include: {
                organizer: {
                    select: { id: true, fullName: true, businessName: true }
                },
                registrations: {
                    include: {
                        user: {
                            select: { id: true, fullName: true, businessName: true }
                        }
                    },
                    take: 10 // Show first 10 attendees
                },
                _count: {
                    select: { registrations: true }
                }
            }
        });
    }

    async registerEvent(eventId: string, userId: string) {
        // Check if already registered
        const existing = await prisma.eventRegistration.findUnique({
            where: {
                eventId_userId: { eventId, userId }
            }
        });

        if (existing) {
            throw new Error("User already registered for this event");
        }

        // Check capacity
        const event = await prisma.event.findUnique({ where: { id: eventId } });
        if (!event) throw new Error("Event not found");

        if (event.maxParticipants) {
            const count = await prisma.eventRegistration.count({ where: { eventId } });
            if (count >= event.maxParticipants) {
                throw new Error("Event is full");
            }
        }

        return prisma.eventRegistration.create({
            data: {
                eventId,
                userId,
                status: 'registered'
            }
        });
    }
}
