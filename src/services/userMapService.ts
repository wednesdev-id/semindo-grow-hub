import { api } from './api';
import { ApiResponse } from '@/types/api';

export interface UserMapPoint {
    id: string;
    name: string;
    role: string;
    avatar?: string;
    businessName?: string;
    lat: number;
    lng: number;
    province?: string;
    city?: string;
    address?: string;
    umkmId?: string;
    type: 'umkm' | 'mentor' | 'consultant' | 'user';
    // Indicates if location is personal (owner) or business (UMKM)
    locationSource?: 'personal' | 'business';
}

export const userMapService = {
    getDistribution: async (): Promise<ApiResponse<UserMapPoint[]>> => {
        const response = await api.get<ApiResponse<UserMapPoint[]>>('/users/distribution');
        return response;
    }
};
