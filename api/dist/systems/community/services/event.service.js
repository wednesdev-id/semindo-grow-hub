"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EventService = void 0;
const prisma_1 = require("../../../lib/prisma");
class EventService {
    async getEvents(params) {
        const { type, search, page = 1, limit = 10 } = params;
        const skip = (page - 1) * limit;
        const where = {};
        if (type && type !== 'all') {
            where.type = type;
        }
        if (search) {
            where.title = { contains: search, mode: "insensitive" };
        }
        const [events, total] = await Promise.all([
            prisma_1.prisma.event.findMany({
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
            prisma_1.prisma.event.count({ where })
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
    async getEvent(id) {
        return prisma_1.prisma.event.findUnique({
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
    async registerEvent(eventId, userId) {
        // Check if already registered
        const existing = await prisma_1.prisma.eventRegistration.findUnique({
            where: {
                eventId_userId: { eventId, userId }
            }
        });
        if (existing) {
            throw new Error("User already registered for this event");
        }
        // Check capacity
        const event = await prisma_1.prisma.event.findUnique({ where: { id: eventId } });
        if (!event)
            throw new Error("Event not found");
        if (event.maxParticipants) {
            const count = await prisma_1.prisma.eventRegistration.count({ where: { eventId } });
            if (count >= event.maxParticipants) {
                throw new Error("Event is full");
            }
        }
        return prisma_1.prisma.eventRegistration.create({
            data: {
                eventId,
                userId,
                status: 'registered'
            }
        });
    }
}
exports.EventService = EventService;
