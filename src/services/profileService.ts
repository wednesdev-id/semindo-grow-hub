import { api } from './api';
import { ApiResponse } from '@/types/api';
import { User, ProfileResponse } from '@/types/auth';

export const profileService = {
    getMe: () => api.get<ApiResponse<ProfileResponse>>('/profile/me'),
    updateUMKM: (data: unknown) => api.put<ApiResponse<unknown>>('/profile/umkm', data),
    updateMentor: (data: unknown) => api.put<ApiResponse<unknown>>('/profile/mentor', data),

    // User Profile Management
    getMyProfile: () => api.get<ApiResponse<User>>('/users/me'),
    updateMyProfile: (data: { fullName?: string; phone?: string; businessName?: string }) =>
        api.patch<ApiResponse<User>>('/users/me', data),
    changePassword: (data: { oldPassword: string; newPassword: string }) =>
        api.post<ApiResponse<{ message: string }>>('/users/me/change-password', data),
    uploadProfilePicture: async (file: File) => {
        const formData = new FormData();
        formData.append('picture', file);
        return api.post<ApiResponse<User>>('/users/me/upload-picture', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    },
};
