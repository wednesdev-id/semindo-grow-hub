import { api } from './api';
import { ApiResponse } from '@/types/api';
import { User } from '@/types/auth';

export const profileService = {
    getMe: () => api.get<ApiResponse<User>>('/profile/me'),
    updateUMKM: (data: unknown) => api.put<ApiResponse<unknown>>('/profile/umkm', data),
    updateMentor: (data: unknown) => api.put<ApiResponse<unknown>>('/profile/mentor', data),
};
