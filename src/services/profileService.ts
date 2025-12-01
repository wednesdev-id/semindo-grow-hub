import { api } from './api';
import { ApiResponse } from '@/types/api';
import { User, ProfileResponse } from '@/types/auth';

export const profileService = {
    getMe: () => api.get<ApiResponse<ProfileResponse>>('/profile/me'),
    updateUMKM: (data: unknown) => api.put<ApiResponse<unknown>>('/profile/umkm', data),
    updateMentor: (data: unknown) => api.put<ApiResponse<unknown>>('/profile/mentor', data),
};
