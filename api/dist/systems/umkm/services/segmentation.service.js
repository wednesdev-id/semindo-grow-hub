"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.segmentationService = exports.SegmentationService = void 0;
const prisma_1 = require("../../../lib/prisma");
/**
 * Segmentation thresholds based on Indonesian UMKM classification
 * Source: PP No. 7 Tahun 2021 tentang Kemudahan, Pelindungan, dan Pemberdayaan UMKM
 */
const SEGMENTATION_THRESHOLDS = {
    // Berdasarkan Omzet per tahun
    PEMULA: { maxTurnover: 300000000, maxAssets: 50000000 },
    MADYA: { maxTurnover: 2500000000, maxAssets: 500000000 },
    // UTAMA: > Madya threshold
};
/**
 * UMKM Level classification based on PP No. 7 Tahun 2021
 */
const UMKM_LEVEL_THRESHOLDS = {
    MIKRO: { maxTurnover: 500000000, maxAssets: 1000000000 },
    KECIL: { maxTurnover: 2500000000, maxAssets: 5000000000 },
    // MENENGAH: > Kecil threshold
};
class SegmentationService {
    /**
     * Calculate segmentation for a single UMKM based on their metrics
     */
    calculateSegmentation(data) {
        const turnover = Number(data.turnover) || 0;
        const assets = Number(data.assets) || 0;
        const employees = Number(data.employees) || 0;
        const assessmentScore = Number(data.selfAssessmentScore) || 0;
        // Determine segmentation (Pemula/Madya/Utama)
        let segmentation;
        let segmentReason;
        if (turnover > SEGMENTATION_THRESHOLDS.MADYA.maxTurnover ||
            assets > SEGMENTATION_THRESHOLDS.MADYA.maxAssets) {
            segmentation = 'Utama';
            segmentReason = `Omzet > Rp ${(SEGMENTATION_THRESHOLDS.MADYA.maxTurnover / 1000000000).toFixed(1)} Milyar atau Aset > Rp ${(SEGMENTATION_THRESHOLDS.MADYA.maxAssets / 1000000).toFixed(0)} Juta`;
        }
        else if (turnover > SEGMENTATION_THRESHOLDS.PEMULA.maxTurnover ||
            assets > SEGMENTATION_THRESHOLDS.PEMULA.maxAssets) {
            segmentation = 'Madya';
            segmentReason = `Omzet Rp ${(SEGMENTATION_THRESHOLDS.PEMULA.maxTurnover / 1000000).toFixed(0)} Juta - Rp ${(SEGMENTATION_THRESHOLDS.MADYA.maxTurnover / 1000000000).toFixed(1)} Milyar`;
        }
        else {
            segmentation = 'Pemula';
            segmentReason = `Omzet < Rp ${(SEGMENTATION_THRESHOLDS.PEMULA.maxTurnover / 1000000).toFixed(0)} Juta`;
        }
        // Determine UMKM level (Mikro/Kecil/Menengah)
        let level;
        if (turnover > UMKM_LEVEL_THRESHOLDS.KECIL.maxTurnover ||
            assets > UMKM_LEVEL_THRESHOLDS.KECIL.maxAssets) {
            level = 'Menengah';
        }
        else if (turnover > UMKM_LEVEL_THRESHOLDS.MIKRO.maxTurnover ||
            assets > UMKM_LEVEL_THRESHOLDS.MIKRO.maxAssets) {
            level = 'Kecil';
        }
        else {
            level = 'Mikro';
        }
        // Calculate readiness score (0-100)
        let score = 0;
        // Turnover contribution (max 30 points)
        if (turnover > 1000000000)
            score += 30;
        else if (turnover > 500000000)
            score += 20;
        else if (turnover > 100000000)
            score += 10;
        // Employee contribution (max 20 points)
        if (employees > 50)
            score += 20;
        else if (employees > 10)
            score += 15;
        else if (employees > 5)
            score += 10;
        else if (employees > 0)
            score += 5;
        // Assets contribution (max 20 points)
        if (assets > 500000000)
            score += 20;
        else if (assets > 100000000)
            score += 15;
        else if (assets > 50000000)
            score += 10;
        // Self assessment contribution (max 30 points)
        score += Math.min(30, assessmentScore * 0.3);
        return {
            segmentation,
            level,
            reason: segmentReason,
            score: Math.round(score),
        };
    }
    /**
     * Get comprehensive segmentation statistics
     */
    async getStats() {
        const total = await prisma_1.prisma.uMKMProfile.count();
        // By segmentation
        const bySegmentationRaw = await prisma_1.prisma.uMKMProfile.groupBy({
            by: ['segmentation'],
            _count: { segmentation: true },
        });
        const bySegmentation = ['Pemula', 'Madya', 'Utama'].map(name => {
            const found = bySegmentationRaw.find(s => s.segmentation === name);
            const count = found?._count.segmentation || 0;
            return {
                name,
                count,
                percentage: total > 0 ? Math.round((count / total) * 100) : 0,
            };
        });
        // By level
        const byLevelRaw = await prisma_1.prisma.uMKMProfile.groupBy({
            by: ['level'],
            _count: { level: true },
        });
        const byLevel = ['Mikro', 'Kecil', 'Menengah'].map(name => {
            const found = byLevelRaw.find(l => l.level === name);
            const count = found?._count.level || 0;
            return {
                name,
                count,
                percentage: total > 0 ? Math.round((count / total) * 100) : 0,
            };
        });
        // By province (top 10)
        const byProvinceRaw = await prisma_1.prisma.uMKMProfile.groupBy({
            by: ['province'],
            _count: { province: true },
            orderBy: { _count: { province: 'desc' } },
            take: 10,
        });
        const byProvince = byProvinceRaw.map(p => ({
            province: p.province || 'Tidak Diketahui',
            count: p._count.province,
            percentage: total > 0 ? Math.round((p._count.province / total) * 100) : 0,
        }));
        // Trends - new this month
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const newThisMonth = await prisma_1.prisma.uMKMProfile.count({
            where: { createdAt: { gte: startOfMonth } },
        });
        // Last month for growth calculation
        const startOfLastMonth = new Date(startOfMonth);
        startOfLastMonth.setMonth(startOfLastMonth.getMonth() - 1);
        const lastMonthCount = await prisma_1.prisma.uMKMProfile.count({
            where: {
                createdAt: {
                    gte: startOfLastMonth,
                    lt: startOfMonth,
                },
            },
        });
        const growthRate = lastMonthCount > 0
            ? Math.round(((newThisMonth - lastMonthCount) / lastMonthCount) * 100)
            : 0;
        return {
            total,
            bySegmentation,
            byLevel,
            byProvince,
            trends: {
                newThisMonth,
                growthRate,
            },
        };
    }
    /**
     * Get UMKM list filtered by segmentation
     */
    async getBySegmentation(params) {
        const page = params.page || 1;
        const limit = params.limit || 20;
        const skip = (page - 1) * limit;
        const where = {};
        if (params.segmentation) {
            where.segmentation = params.segmentation;
        }
        if (params.level) {
            where.level = params.level;
        }
        if (params.province) {
            where.province = { contains: params.province, mode: 'insensitive' };
        }
        if (params.city) {
            where.city = { contains: params.city, mode: 'insensitive' };
        }
        if (params.search) {
            where.OR = [
                { businessName: { contains: params.search, mode: 'insensitive' } },
                { ownerName: { contains: params.search, mode: 'insensitive' } },
            ];
        }
        const [total, data] = await Promise.all([
            prisma_1.prisma.uMKMProfile.count({ where }),
            prisma_1.prisma.uMKMProfile.findMany({
                where,
                skip,
                take: limit,
                select: {
                    id: true,
                    businessName: true,
                    ownerName: true,
                    province: true,
                    city: true,
                    segmentation: true,
                    level: true,
                    turnover: true,
                    employees: true,
                    sector: true,
                    status: true,
                    createdAt: true,
                },
                orderBy: [
                    { segmentation: 'asc' },
                    { turnover: 'desc' },
                ],
            }),
        ]);
        return {
            data: data.map(d => ({
                ...d,
                turnover: d.turnover ? Number(d.turnover) : null,
            })),
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
    /**
     * Recalculate segmentation for a single UMKM
     */
    async recalculateSegmentation(id) {
        const profile = await prisma_1.prisma.uMKMProfile.findUnique({
            where: { id },
            select: {
                turnover: true,
                assets: true,
                employees: true,
                selfAssessmentScore: true,
            },
        });
        if (!profile) {
            throw new Error('UMKM Profile not found');
        }
        const result = this.calculateSegmentation({
            turnover: profile.turnover ? Number(profile.turnover) : null,
            assets: profile.assets ? Number(profile.assets) : null,
            employees: profile.employees,
            selfAssessmentScore: profile.selfAssessmentScore
                ? Number(profile.selfAssessmentScore)
                : null,
        });
        return prisma_1.prisma.uMKMProfile.update({
            where: { id },
            data: {
                segmentation: result.segmentation,
                level: result.level,
                segmentationReason: result.reason,
            },
        });
    }
    /**
     * Bulk recalculate segmentation for all UMKM
     */
    async bulkRecalculateSegmentation() {
        const allProfiles = await prisma_1.prisma.uMKMProfile.findMany({
            select: {
                id: true,
                turnover: true,
                assets: true,
                employees: true,
                selfAssessmentScore: true,
                segmentation: true,
                level: true,
            },
        });
        let updated = 0;
        for (const profile of allProfiles) {
            const result = this.calculateSegmentation({
                turnover: profile.turnover ? Number(profile.turnover) : null,
                assets: profile.assets ? Number(profile.assets) : null,
                employees: profile.employees,
                selfAssessmentScore: profile.selfAssessmentScore
                    ? Number(profile.selfAssessmentScore)
                    : null,
            });
            // Only update if segmentation changed
            if (profile.segmentation !== result.segmentation ||
                profile.level !== result.level) {
                await prisma_1.prisma.uMKMProfile.update({
                    where: { id: profile.id },
                    data: {
                        segmentation: result.segmentation,
                        level: result.level,
                        segmentationReason: result.reason,
                    },
                });
                updated++;
            }
        }
        return {
            processed: allProfiles.length,
            updated,
        };
    }
}
exports.SegmentationService = SegmentationService;
exports.segmentationService = new SegmentationService();
