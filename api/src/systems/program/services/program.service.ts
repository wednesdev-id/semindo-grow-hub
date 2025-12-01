import { prisma } from '../../../lib/prisma';
import { Prisma } from '@prisma/client';

export class ProgramService {
    async getPrograms(filter?: { type?: string; status?: string; organizerId?: string }) {
        const where: Prisma.ProgramWhereInput = {};

        if (filter?.type) where.type = filter.type;
        if (filter?.status) where.status = filter.status;
        if (filter?.organizerId) where.organizerId = filter.organizerId;

        return prisma.program.findMany({
            where,
            include: {
                organizer: {
                    select: {
                        id: true,
                        fullName: true,
                        businessName: true,
                    },
                },
                batches: {
                    orderBy: { startDate: 'desc' },
                    take: 1, // Get latest batch
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getProgramById(id: string) {
        return prisma.program.findUnique({
            where: { id },
            include: {
                organizer: {
                    select: {
                        id: true,
                        fullName: true,
                        businessName: true,
                    },
                },
                batches: {
                    include: {
                        _count: {
                            select: { participants: true },
                        },
                    },
                    orderBy: { startDate: 'desc' },
                },
            },
        });
    }

    async createProgram(data: {
        title: string;
        description: string;
        type: string;
        startDate: Date;
        endDate: Date;
        organizerId: string;
        bannerUrl?: string;
    }) {
        return prisma.program.create({
            data: {
                ...data,
                status: 'draft',
            },
        });
    }

    async updateProgram(id: string, data: Prisma.ProgramUpdateInput) {
        return prisma.program.update({
            where: { id },
            data,
        });
    }

    async createBatch(programId: string, data: {
        name: string;
        startDate: Date;
        endDate: Date;
        maxParticipants: number;
    }) {
        return prisma.programBatch.create({
            data: {
                ...data,
                programId,
            },
        });
    }

    async applyToBatch(batchId: string, userId: string) {
        // Check if already applied
        const existing = await prisma.programParticipant.findUnique({
            where: {
                batchId_userId: {
                    batchId,
                    userId,
                },
            },
        });

        if (existing) {
            throw new Error('User already applied to this batch');
        }

        // Check capacity
        const batch = await prisma.programBatch.findUnique({
            where: { id: batchId },
            include: {
                _count: {
                    select: { participants: true },
                },
            },
        });

        if (!batch) throw new Error('Batch not found');

        if (batch._count.participants >= batch.maxParticipants) {
            throw new Error('Batch is full');
        }

        return prisma.programParticipant.create({
            data: {
                batchId,
                userId,
                status: 'applied',
            },
        });
    }

    async getBatchParticipants(batchId: string) {
        return prisma.programParticipant.findMany({
            where: { batchId },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        phone: true,
                        businessName: true,
                        umkmProfile: {
                            select: {
                                businessName: true,
                                sector: true,
                                city: true
                            }
                        }
                    },
                },
            },
            orderBy: { joinedAt: 'desc' },
        });
    }

    async updateParticipantStatus(participantId: string, status: string) {
        return prisma.programParticipant.update({
            where: { id: participantId },
            data: { status },
        });
    }

    async getMyParticipations(userId: string) {
        return prisma.programParticipant.findMany({
            where: { userId },
            include: {
                batch: {
                    include: {
                        program: {
                            select: {
                                id: true,
                                title: true,
                                type: true,
                                bannerUrl: true,
                                organizer: {
                                    select: {
                                        businessName: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
            orderBy: { joinedAt: 'desc' },
        });
    }
}
