import { prisma } from '../../../lib/prisma';
import { Prisma } from '../../../../prisma/generated/client';

export interface RegionStats {
    province: string;
    city?: string;
    totalUMKM: number;
    bySegmentation: Record<string, number>;
    byLevel: Record<string, number>;
    avgTurnover: number;
    avgEmployees: number;
    verifiedCount: number;
}

export interface MapDataPoint {
    id: string;
    businessName: string;
    province: string;
    city: string;
    lat: number | null;
    lng: number | null;
    segmentation: string;
    level: string;
    sector: string | null;
}

export interface ProvinceAggregation {
    province: string;
    count: number;
    lat?: number;
    lng?: number;
}

// Indonesia province center coordinates (approximate)
const PROVINCE_COORDINATES: Record<string, { lat: number; lng: number }> = {
    'Aceh': { lat: 4.695135, lng: 96.749397 },
    'Sumatera Utara': { lat: 2.115355, lng: 99.545097 },
    'Sumatera Barat': { lat: -0.739940, lng: 100.800003 },
    'Riau': { lat: 0.507068, lng: 101.447777 },
    'Kepulauan Riau': { lat: 3.945638, lng: 108.142166 },
    'Jambi': { lat: -1.609972, lng: 103.607254 },
    'Sumatera Selatan': { lat: -3.319437, lng: 103.914399 },
    'Bangka Belitung': { lat: -2.741050, lng: 106.440588 },
    'Bengkulu': { lat: -3.792857, lng: 102.260760 },
    'Lampung': { lat: -4.558585, lng: 105.406586 },
    'DKI Jakarta': { lat: -6.211544, lng: 106.845172 },
    'Jawa Barat': { lat: -6.914744, lng: 107.609810 },
    'Banten': { lat: -6.405817, lng: 106.064018 },
    'Jawa Tengah': { lat: -7.150975, lng: 110.140259 },
    'DI Yogyakarta': { lat: -7.797068, lng: 110.370529 },
    'Daerah Istimewa Yogyakarta': { lat: -7.797068, lng: 110.370529 },
    'Jawa Timur': { lat: -7.536064, lng: 112.238402 },
    'Bali': { lat: -8.340539, lng: 115.091949 },
    'Nusa Tenggara Barat': { lat: -8.652930, lng: 117.361648 },
    'Nusa Tenggara Timur': { lat: -8.657383, lng: 121.079372 },
    'Kalimantan Barat': { lat: -0.278790, lng: 111.475293 },
    'Kalimantan Tengah': { lat: -1.681490, lng: 113.382355 },
    'Kalimantan Selatan': { lat: -3.092641, lng: 115.283478 },
    'Kalimantan Timur': { lat: 0.538659, lng: 116.419389 },
    'Kalimantan Utara': { lat: 3.073020, lng: 116.041740 },
    'Sulawesi Utara': { lat: 0.625993, lng: 123.975021 },
    'Gorontalo': { lat: 0.545290, lng: 123.062126 },
    'Sulawesi Tengah': { lat: -1.430427, lng: 121.445612 },
    'Sulawesi Barat': { lat: -2.844726, lng: 119.232070 },
    'Sulawesi Selatan': { lat: -3.669500, lng: 119.999889 },
    'Sulawesi Tenggara': { lat: -4.144919, lng: 122.174605 },
    'Maluku': { lat: -3.238462, lng: 130.145270 },
    'Maluku Utara': { lat: 1.570858, lng: 127.808808 },
    'Papua': { lat: -4.269928, lng: 138.080353 },
    'Papua Barat': { lat: -1.336826, lng: 133.174166 },
    'Papua Tengah': { lat: -3.510000, lng: 136.890000 },
    'Papua Pegunungan': { lat: -4.100000, lng: 138.500000 },
    'Papua Selatan': { lat: -6.500000, lng: 139.500000 },
    'Papua Barat Daya': { lat: -2.000000, lng: 131.500000 },
    // Common variations
    'Jawa': { lat: -7.150975, lng: 110.140259 },
    'Yogyakarta': { lat: -7.797068, lng: 110.370529 },
    'DIY': { lat: -7.797068, lng: 110.370529 },
    'Jakarta': { lat: -6.211544, lng: 106.845172 },
};

export class RegionService {
    /**
     * Get list of provinces with UMKM count
     */
    async getProvinces(): Promise<ProvinceAggregation[]> {
        const result = await prisma.uMKMProfile.groupBy({
            by: ['province'],
            _count: { province: true },
            orderBy: { _count: { province: 'desc' } },
        });

        return result.map(r => {
            const provinceName = r.province || 'Tidak Diketahui';
            const coords = PROVINCE_COORDINATES[provinceName];
            return {
                province: provinceName,
                count: r._count.province,
                lat: coords?.lat,
                lng: coords?.lng,
            };
        });
    }

    /**
     * Get detailed stats for a specific province
     */
    async getProvinceStats(province: string): Promise<RegionStats> {
        const where: Prisma.UMKMProfileWhereInput = {
            province: { contains: province, mode: 'insensitive' },
        };

        const [
            totalUMKM,
            bySegmentation,
            byLevel,
            avgMetrics,
            verifiedCount,
        ] = await Promise.all([
            prisma.uMKMProfile.count({ where }),
            prisma.uMKMProfile.groupBy({
                by: ['segmentation'],
                _count: { segmentation: true },
                where,
            }),
            prisma.uMKMProfile.groupBy({
                by: ['level'],
                _count: { level: true },
                where,
            }),
            prisma.uMKMProfile.aggregate({
                where,
                _avg: {
                    turnover: true,
                    employees: true,
                },
            }),
            prisma.uMKMProfile.count({
                where: { ...where, status: 'verified' },
            }),
        ]);

        return {
            province,
            totalUMKM,
            bySegmentation: Object.fromEntries(
                bySegmentation.map(s => [s.segmentation || 'Unknown', s._count.segmentation])
            ),
            byLevel: Object.fromEntries(
                byLevel.map(l => [l.level || 'Unknown', l._count.level])
            ),
            avgTurnover: Number(avgMetrics._avg.turnover) || 0,
            avgEmployees: Math.round(avgMetrics._avg.employees || 0),
            verifiedCount,
        };
    }

    /**
     * Get cities within a province with UMKM count
     */
    async getCitiesByProvince(province: string) {
        const result = await prisma.uMKMProfile.groupBy({
            by: ['city'],
            _count: { city: true },
            where: {
                province: { contains: province, mode: 'insensitive' },
            },
            orderBy: { _count: { city: 'desc' } },
        });

        return result.map(r => ({
            city: r.city || 'Tidak Diketahui',
            count: r._count.city,
        }));
    }

    /**
     * Get city-level detailed stats
     */
    async getCityStats(province: string, city: string): Promise<RegionStats> {
        const where: Prisma.UMKMProfileWhereInput = {
            province: { contains: province, mode: 'insensitive' },
            city: { contains: city, mode: 'insensitive' },
        };

        const [
            totalUMKM,
            bySegmentation,
            byLevel,
            avgMetrics,
            verifiedCount,
        ] = await Promise.all([
            prisma.uMKMProfile.count({ where }),
            prisma.uMKMProfile.groupBy({
                by: ['segmentation'],
                _count: { segmentation: true },
                where,
            }),
            prisma.uMKMProfile.groupBy({
                by: ['level'],
                _count: { level: true },
                where,
            }),
            prisma.uMKMProfile.aggregate({
                where,
                _avg: {
                    turnover: true,
                    employees: true,
                },
            }),
            prisma.uMKMProfile.count({
                where: { ...where, status: 'verified' },
            }),
        ]);

        return {
            province,
            city,
            totalUMKM,
            bySegmentation: Object.fromEntries(
                bySegmentation.map(s => [s.segmentation || 'Unknown', s._count.segmentation])
            ),
            byLevel: Object.fromEntries(
                byLevel.map(l => [l.level || 'Unknown', l._count.level])
            ),
            avgTurnover: Number(avgMetrics._avg.turnover) || 0,
            avgEmployees: Math.round(avgMetrics._avg.employees || 0),
            verifiedCount,
        };
    }

    /**
     * Get map data points for all UMKM with coordinates
     */
    async getMapData(params?: {
        province?: string;
        city?: string;
        segmentation?: string;
        level?: string;
        limit?: number;
    }): Promise<MapDataPoint[]> {
        const where: Prisma.UMKMProfileWhereInput = {};

        if (params?.province) {
            where.province = { contains: params.province, mode: 'insensitive' };
        }

        if (params?.city) {
            where.city = { contains: params.city, mode: 'insensitive' };
        }

        if (params?.segmentation) {
            where.segmentation = params.segmentation;
        }

        if (params?.level) {
            where.level = params.level;
        }

        const profiles = await prisma.uMKMProfile.findMany({
            where,
            take: params?.limit || 1000,
            select: {
                id: true,
                businessName: true,
                ownerName: true,
                province: true,
                city: true,
                location: true,
                segmentation: true,
                level: true,
                sector: true,
                turnover: true,
                employees: true,
                status: true,
            },
        });

        return profiles.map(p => {
            const location = p.location as { lat?: number; lng?: number } | null;
            // If no specific coordinates, use province center
            let lat = location?.lat || null;
            let lng = location?.lng || null;

            if (!lat || !lng) {
                const provinceCoords = PROVINCE_COORDINATES[p.province || ''];
                if (provinceCoords) {
                    // Add small random offset to prevent exact overlap
                    lat = provinceCoords.lat + (Math.random() - 0.5) * 0.5;
                    lng = provinceCoords.lng + (Math.random() - 0.5) * 0.5;
                }
            }

            return {
                id: p.id,
                businessName: p.businessName,
                ownerName: p.ownerName,
                province: p.province || 'Tidak Diketahui',
                city: p.city || 'Tidak Diketahui',
                lat,
                lng,
                segmentation: p.segmentation || 'Pemula',
                level: p.level || 'Mikro',
                sector: p.sector,
                turnover: p.turnover ? Number(p.turnover) : null,
                employees: p.employees,
                status: p.status,
            };
        });
    }

    /**
     * Get heatmap data (aggregated counts per province)
     */
    async getHeatmapData() {
        const provinces = await this.getProvinces();

        return provinces
            .filter(p => p.lat && p.lng)
            .map(p => ({
                lat: p.lat!,
                lng: p.lng!,
                weight: p.count,
                province: p.province,
            }));
    }
}

export const regionService = new RegionService();
