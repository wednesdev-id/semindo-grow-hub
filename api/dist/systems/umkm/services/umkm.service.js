"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UMKMService = void 0;
const prisma_1 = require("../../../lib/prisma");
class UMKMService {
    async getStats() {
        const total = await prisma_1.prisma.uMKMProfile.count();
        const verified = await prisma_1.prisma.uMKMProfile.count({ where: { status: 'verified' } });
        const unverified = await prisma_1.prisma.uMKMProfile.count({ where: { status: 'unverified' } });
        const byLevel = await prisma_1.prisma.uMKMProfile.groupBy({
            by: ['level'],
            _count: { level: true },
        });
        return {
            total,
            verified,
            unverified,
            byLevel: byLevel.map(item => ({ level: item.level || 'Unknown', count: item._count.level })),
        };
    }
    async findAll(params) {
        const page = params.page || 1;
        const limit = params.limit || 10;
        const skip = (page - 1) * limit;
        const where = {};
        // Filter by userId
        if (params.userId) {
            where.userId = params.userId;
        }
        if (params.search) {
            where.OR = [
                { businessName: { contains: params.search, mode: 'insensitive' } },
                { ownerName: { contains: params.search, mode: 'insensitive' } },
                { nib: { contains: params.search, mode: 'insensitive' } },
            ];
        }
        if (params.segmentation) {
            where.segmentation = params.segmentation;
        }
        if (params.city) {
            where.city = params.city;
        }
        if (params.province) {
            where.province = params.province;
        }
        if (params.sector) {
            where.sector = params.sector;
        }
        const [total, data] = await Promise.all([
            prisma_1.prisma.uMKMProfile.count({ where }),
            prisma_1.prisma.uMKMProfile.findMany({
                where,
                skip,
                take: limit,
                include: {
                    user: {
                        select: {
                            email: true,
                            phone: true,
                        },
                    },
                    documents: true,
                    _count: {
                        select: { mentoringSessions: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
            }),
        ]);
        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    async findById(id) {
        return prisma_1.prisma.uMKMProfile.findUnique({
            where: { id },
            include: {
                user: true,
                documents: true,
                mentoringSessions: {
                    include: {
                        mentor: {
                            include: {
                                user: true,
                            },
                        },
                    },
                    orderBy: { date: 'desc' },
                },
                tags: true,
                category: true,
            },
        });
    }
    async create(userId, data) {
        // Auto-calculate segmentation based on turnover and employees if provided
        const segmentation = this.calculateSegmentation(data);
        return prisma_1.prisma.uMKMProfile.create({
            data: {
                ...data,
                segmentation: segmentation.level,
                segmentationReason: segmentation.reason,
                user: { connect: { id: userId } },
            },
        });
    }
    async update(id, data) {
        // Recalculate segmentation if relevant fields are updated
        let segmentationUpdate = {};
        if (data.turnover || data.employees || data.legalStatus) {
            // We need current data to merge with updates for calculation
            const current = await prisma_1.prisma.uMKMProfile.findUnique({ where: { id } });
            if (current) {
                const merged = { ...current, ...data };
                const segmentation = this.calculateSegmentation(merged);
                segmentationUpdate = {
                    segmentation: segmentation.level,
                    segmentationReason: segmentation.reason,
                };
            }
        }
        return prisma_1.prisma.uMKMProfile.update({
            where: { id },
            data: {
                ...data,
                ...segmentationUpdate,
            },
        });
    }
    async delete(id) {
        return prisma_1.prisma.uMKMProfile.delete({
            where: { id },
        });
    }
    calculateSegmentation(data) {
        // Simple rule-based segmentation logic
        // Pemula: < 300M/year
        // Madya: 300M - 2.5B/year
        // Utama: > 2.5B/year
        const turnover = Number(data.turnover) || 0;
        if (turnover > 2500000000) {
            return { level: 'Utama', reason: 'Omzet > 2.5 Milyar' };
        }
        else if (turnover > 300000000) {
            return { level: 'Madya', reason: 'Omzet > 300 Juta' };
        }
        else {
            return { level: 'Pemula', reason: 'Omzet < 300 Juta' };
        }
    }
}
exports.UMKMService = UMKMService;
