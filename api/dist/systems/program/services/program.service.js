"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgramService = void 0;
const prisma_1 = require("../../../lib/prisma");
class ProgramService {
    async getPrograms(filter) {
        const where = {};
        if (filter?.type)
            where.type = filter.type;
        if (filter?.status)
            where.status = filter.status;
        if (filter?.organizerId)
            where.organizerId = filter.organizerId;
        return prisma_1.prisma.program.findMany({
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
    async getProgramById(id) {
        return prisma_1.prisma.program.findUnique({
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
                milestones: {
                    orderBy: { order: 'asc' },
                },
            },
        });
    }
    async createProgram(data) {
        return prisma_1.prisma.program.create({
            data: {
                ...data,
                status: 'draft',
            },
        });
    }
    async updateProgram(id, data) {
        return prisma_1.prisma.program.update({
            where: { id },
            data,
        });
    }
    async createBatch(programId, data) {
        return prisma_1.prisma.programBatch.create({
            data: {
                ...data,
                programId,
            },
        });
    }
    async applyToBatch(batchId, userId) {
        // Check if already applied
        const existing = await prisma_1.prisma.programParticipant.findUnique({
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
        const batch = await prisma_1.prisma.programBatch.findUnique({
            where: { id: batchId },
            include: {
                _count: {
                    select: { participants: true },
                },
            },
        });
        if (!batch)
            throw new Error('Batch not found');
        if (batch._count.participants >= batch.maxParticipants) {
            throw new Error('Batch is full');
        }
        return prisma_1.prisma.programParticipant.create({
            data: {
                batchId,
                userId,
                status: 'applied',
            },
        });
    }
    async getBatchParticipants(batchId) {
        return prisma_1.prisma.programParticipant.findMany({
            where: { batchId },
            include: {
                user: {
                    select: {
                        id: true,
                        fullName: true,
                        email: true,
                        phone: true,
                        businessName: true,
                        umkmProfiles: {
                            select: {
                                businessName: true,
                                sector: true,
                                city: true
                            },
                            take: 1 // Get first/primary profile
                        }
                    },
                },
            },
            orderBy: { joinedAt: 'desc' },
        });
    }
    async updateParticipantStatus(participantId, status) {
        return prisma_1.prisma.programParticipant.update({
            where: { id: participantId },
            data: { status },
        });
    }
    async getMyParticipations(userId) {
        return prisma_1.prisma.programParticipant.findMany({
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
    async getProgramMilestones(programId) {
        return prisma_1.prisma.programMilestone.findMany({
            where: { programId },
            orderBy: { order: 'asc' },
        });
    }
    async createMilestone(programId, data) {
        return prisma_1.prisma.programMilestone.create({
            data: {
                ...data,
                programId,
            },
        });
    }
    async updateMilestone(id, data) {
        return prisma_1.prisma.programMilestone.update({
            where: { id },
            data,
        });
    }
    async deleteMilestone(id) {
        return prisma_1.prisma.programMilestone.delete({
            where: { id },
        });
    }
}
exports.ProgramService = ProgramService;
