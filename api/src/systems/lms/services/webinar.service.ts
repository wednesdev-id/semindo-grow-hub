import { Prisma, MentorEvent } from '../../../../prisma/generated/client';
import { prisma } from '../../../lib/prisma';

export class WebinarService {
    async findAll(params: {
        skip?: number;
        take?: number;
        search?: string;
        type?: string;
        city?: string;
        isOnline?: boolean;
    }): Promise<MentorEvent[]> {
        const { skip, take, search, type, city, isOnline } = params;

        const where: Prisma.MentorEventWhereInput = {
            status: 'published',
        };

        if (type) {
            where.type = type;
        } else {
            // Default to showing only webinars and events if no specific type is requested, 
            // but user might want 'webinar' by default. 
            // For now, let's allow any type if not specified, or strictly 'webinar' if logic demands.
            // The design implies "Webinar" is the main tab.
            // where.type = 'webinar'; // Let's not force it here, let controller decide default.
        }

        if (city) {
            where.city = city;
        }

        if (isOnline !== undefined) {
            if (isOnline) {
                where.venue = { contains: 'Online' };
            } else {
                where.venue = { not: { contains: 'Online' } };
            }
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        return prisma.mentorEvent.findMany({
            skip,
            take,
            where,
            orderBy: { startDate: 'asc' }, // Show upcoming first
            include: {
                mentor: {
                    include: {
                        user: {
                            select: {
                                fullName: true,
                                profilePictureUrl: true,
                            }
                        }
                    }
                }
            }
        });
    }

    async findOne(id: string): Promise<MentorEvent | null> {
        return prisma.mentorEvent.findUnique({
            where: { id },
            include: {
                mentor: {
                    include: {
                        user: {
                            select: {
                                fullName: true,
                                profilePictureUrl: true,
                            }
                        }
                    }
                },
                attendees: true // Include attendees count if needed
            }
        });
    }
}
