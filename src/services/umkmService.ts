import { api } from './api';

export type UMKMStatus = 'unverified' | 'submitted' | 'in_review' | 'verified' | 'rejected';

export interface UMKMTag {
    id: string;
    name: string;
    color: string;
}

export interface UMKMCategory {
    id: string;
    name: string;
    slug: string;
    description?: string;
}

export interface UMKMProfile {
    id: string;
    userId: string;
    businessName: string;
    ownerName: string;
    address?: string;
    city?: string;
    province?: string;
    postalCode?: string;
    phone?: string;
    email?: string;
    website?: string;

    // Business Metrics
    categoryId?: string;
    category?: UMKMCategory;
    turnover?: number;
    assets?: number;
    employees?: number;
    foundedYear?: number;

    // Detailed Profile
    productionCapacity?: string;
    salesChannels?: string[];
    socialMedia?: Record<string, string>;
    omzetMonthly?: number;
    legalStatus?: Record<string, boolean>; // { nib: true, npwp: false }

    // Status & Metadata
    status: UMKMStatus;
    level?: string;
    tags: UMKMTag[];
    createdAt: string;
    updatedAt: string;
}

// Mock Data
let mockTags: UMKMTag[] = [
    { id: '1', name: 'High Growth', color: '#10B981' }, // Green
    { id: '2', name: 'Export Ready', color: '#3B82F6' }, // Blue
    { id: '3', name: 'Need Funding', color: '#F59E0B' }, // Amber
    { id: '4', name: 'Woman Owned', color: '#EC4899' }, // Pink
    { id: '5', name: 'Digitalized', color: '#8B5CF6' }, // Purple
];

let mockCategories: UMKMCategory[] = [
    { id: '1', name: 'Kuliner', slug: 'kuliner', description: 'Makanan dan Minuman' },
    { id: '2', name: 'Fashion', slug: 'fashion', description: 'Pakaian dan Aksesoris' },
    { id: '3', name: 'Kerajinan', slug: 'kerajinan', description: 'Kerajinan Tangan' },
    { id: '4', name: 'Pertanian', slug: 'pertanian', description: 'Hasil Bumi dan Olahan' },
    { id: '5', name: 'Jasa', slug: 'jasa', description: 'Layanan Profesional' },
];

let mockProfiles: UMKMProfile[] = [
    {
        id: '1',
        userId: 'user-1',
        businessName: 'Kopi Kenangan Senja',
        ownerName: 'Budi Santoso',
        city: 'Jakarta Selatan',
        province: 'DKI Jakarta',
        categoryId: '1',
        category: mockCategories[0],
        turnover: 500000000,
        employees: 15,
        status: 'verified',
        tags: [mockTags[0], mockTags[4]],
        createdAt: new Date('2023-01-15').toISOString(),
        updatedAt: new Date('2023-06-20').toISOString(),
        salesChannels: ['Offline Store', 'GoFood', 'GrabFood'],
        legalStatus: { nib: true, npwp: true, pirt: true, halal: true },
    },
    {
        id: '2',
        userId: 'user-2',
        businessName: 'Batik Tradisi Solo',
        ownerName: 'Siti Aminah',
        city: 'Surakarta',
        province: 'Jawa Tengah',
        categoryId: '2',
        category: mockCategories[1],
        turnover: 120000000,
        employees: 5,
        status: 'in_review',
        tags: [mockTags[1], mockTags[3]],
        createdAt: new Date('2023-03-10').toISOString(),
        updatedAt: new Date('2023-03-12').toISOString(),
        salesChannels: ['Instagram', 'Shopee'],
        legalStatus: { nib: true, npwp: true },
    },
    {
        id: '3',
        userId: 'user-3',
        businessName: 'Keripik Pisang Mantap',
        ownerName: 'Joko Susilo',
        city: 'Bandung',
        province: 'Jawa Barat',
        categoryId: '1',
        category: mockCategories[0],
        turnover: 50000000,
        employees: 3,
        status: 'submitted',
        tags: [mockTags[2]],
        createdAt: new Date('2023-05-05').toISOString(),
        updatedAt: new Date('2023-05-05').toISOString(),
        salesChannels: ['WhatsApp', 'Tokopedia'],
        legalStatus: { nib: true },
    },
];

export const umkmService = {
    // Profiles
    getAllProfiles: async (params?: any) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        return { data: mockProfiles, total: mockProfiles.length };
    },

    getProfileById: async (id: string) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const profile = mockProfiles.find(p => p.id === id);
        if (!profile) throw new Error('Profile not found');
        return { data: profile };
    },

    createProfile: async (data: Partial<UMKMProfile>) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const newProfile: UMKMProfile = {
            id: Math.random().toString(36).substr(2, 9),
            userId: 'user-' + Math.random().toString(36).substr(2, 9),
            businessName: data.businessName || '',
            ownerName: data.ownerName || '',
            status: 'submitted',
            tags: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            ...data,
        } as UMKMProfile;
        mockProfiles.push(newProfile);
        return { data: newProfile };
    },

    updateProfile: async (id: string, data: Partial<UMKMProfile>) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        const index = mockProfiles.findIndex(p => p.id === id);
        if (index === -1) throw new Error('Profile not found');
        mockProfiles[index] = { ...mockProfiles[index], ...data, updatedAt: new Date().toISOString() };
        return { data: mockProfiles[index] };
    },

    deleteProfile: async (id: string) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        mockProfiles = mockProfiles.filter(p => p.id !== id);
        return { success: true };
    },

    // Verification
    verifyProfile: async (id: string, status: UMKMStatus, reason?: string) => {
        await new Promise(resolve => setTimeout(resolve, 800));
        const index = mockProfiles.findIndex(p => p.id === id);
        if (index === -1) throw new Error('Profile not found');
        mockProfiles[index] = {
            ...mockProfiles[index],
            status,
            updatedAt: new Date().toISOString()
        };
        return { data: mockProfiles[index] };
    },

    // Tags
    getAllTags: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return { data: mockTags };
    },

    addTag: async (profileId: string, tagId: string) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const profileIndex = mockProfiles.findIndex(p => p.id === profileId);
        const tag = mockTags.find(t => t.id === tagId);
        if (profileIndex === -1 || !tag) throw new Error('Profile or Tag not found');

        const profile = mockProfiles[profileIndex];
        if (!profile.tags.find(t => t.id === tagId)) {
            profile.tags.push(tag);
        }
        return { data: profile };
    },

    removeTag: async (profileId: string, tagId: string) => {
        await new Promise(resolve => setTimeout(resolve, 500));
        const profileIndex = mockProfiles.findIndex(p => p.id === profileId);
        if (profileIndex === -1) throw new Error('Profile not found');

        mockProfiles[profileIndex].tags = mockProfiles[profileIndex].tags.filter(t => t.id !== tagId);
        return { data: mockProfiles[profileIndex] };
    },

    // Categories
    getAllCategories: async () => {
        await new Promise(resolve => setTimeout(resolve, 300));
        return { data: mockCategories };
    },
};

// ============================================
// SEGMENTATION & REGION MAPPING API
// ============================================

export interface SegmentationStats {
    total: number;
    bySegmentation: { name: string; count: number; percentage: number }[];
    byLevel: { name: string; count: number; percentage: number }[];
    byProvince: { province: string; count: number; percentage: number }[];
    trends: {
        newThisMonth: number;
        growthRate: number;
    };
}

export interface UMKMSegmentItem {
    id: string;
    businessName: string;
    ownerName: string;
    province: string | null;
    city: string | null;
    segmentation: string | null;
    level: string | null;
    turnover: number | null;
    employees: number | null;
    sector: string | null;
    status: string;
    createdAt: string;
}

export interface ProvinceData {
    province: string;
    count: number;
    lat?: number;
    lng?: number;
}

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
    ownerName?: string;
    province: string;
    city: string;
    lat: number | null;
    lng: number | null;
    segmentation: string;
    level: string;
    sector: string | null;
    // Additional statistics
    turnover?: number | null;
    employees?: number | null;
    status?: string;
}

export const segmentationApi = {
    getStats: async (): Promise<SegmentationStats> => {
        const response = await api.get<{ success: boolean; data: SegmentationStats }>('/umkm/segmentation/stats');
        return response.data;
    },

    getList: async (params?: {
        segmentation?: string;
        level?: string;
        province?: string;
        city?: string;
        page?: number;
        limit?: number;
        search?: string;
    }): Promise<{ data: UMKMSegmentItem[]; meta: { total: number; page: number; limit: number; totalPages: number } }> => {
        const queryParams = new URLSearchParams();
        if (params?.segmentation) queryParams.append('segmentation', params.segmentation);
        if (params?.level) queryParams.append('level', params.level);
        if (params?.province) queryParams.append('province', params.province);
        if (params?.city) queryParams.append('city', params.city);
        if (params?.page) queryParams.append('page', params.page.toString());
        if (params?.limit) queryParams.append('limit', params.limit.toString());
        if (params?.search) queryParams.append('search', params.search);

        const url = `/umkm/segmentation/list${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        const response = await api.get<{ success: boolean; data: UMKMSegmentItem[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(url);
        return { data: response.data, meta: response.meta };
    },

    calculatePreview: async (data: {
        turnover?: number;
        assets?: number;
        employees?: number;
        selfAssessmentScore?: number;
    }): Promise<{ segmentation: string; level: string; reason: string; score: number }> => {
        const response = await api.post<{ success: boolean; data: { segmentation: string; level: string; reason: string; score: number } }>('/umkm/calculate-segmentation', data);
        return response.data;
    },

    recalculate: async (id: string): Promise<void> => {
        await api.post(`/umkm/${id}/recalculate-segmentation`, {});
    },

    bulkRecalculate: async (): Promise<{ processed: number; updated: number }> => {
        const response = await api.post<{ success: boolean; data: { processed: number; updated: number } }>('/umkm/segmentation/bulk-recalculate', {});
        return response.data;
    },
};

export const regionApi = {
    getProvinces: async (): Promise<ProvinceData[]> => {
        const response = await api.get<{ success: boolean; data: ProvinceData[] }>('/umkm/regions');
        return response.data;
    },

    getProvinceStats: async (province: string): Promise<RegionStats> => {
        const response = await api.get<{ success: boolean; data: RegionStats }>(`/umkm/regions/${encodeURIComponent(province)}`);
        return response.data;
    },

    getCities: async (province: string): Promise<{ city: string; count: number }[]> => {
        const response = await api.get<{ success: boolean; data: { city: string; count: number }[] }>(`/umkm/regions/${encodeURIComponent(province)}/cities`);
        return response.data;
    },

    getCityStats: async (province: string, city: string): Promise<RegionStats> => {
        const response = await api.get<{ success: boolean; data: RegionStats }>(`/umkm/regions/${encodeURIComponent(province)}/${encodeURIComponent(city)}`);
        return response.data;
    },

    getMapData: async (params?: {
        province?: string;
        city?: string;
        segmentation?: string;
        level?: string;
        limit?: number;
    }): Promise<MapDataPoint[]> => {
        const queryParams = new URLSearchParams();
        if (params?.province) queryParams.append('province', params.province);
        if (params?.city) queryParams.append('city', params.city);
        if (params?.segmentation) queryParams.append('segmentation', params.segmentation);
        if (params?.level) queryParams.append('level', params.level);
        if (params?.limit) queryParams.append('limit', params.limit.toString());

        const url = `/umkm/map-data${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
        const response = await api.get<{ success: boolean; data: MapDataPoint[] }>(url);
        return response.data;
    },

    getHeatmap: async (): Promise<{ lat: number; lng: number; weight: number; province: string }[]> => {
        const response = await api.get<{ success: boolean; data: { lat: number; lng: number; weight: number; province: string }[] }>('/umkm/heatmap');
        return response.data;
    },
};

