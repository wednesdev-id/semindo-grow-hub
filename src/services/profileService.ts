import { api } from './api';
import { ApiResponse } from '@/types/api';
import { User, ProfileResponse, UMKMProfile } from '@/types/auth';

export const profileService = {
    getMe: () => api.get<ApiResponse<ProfileResponse>>('/profile/me'),

    // UMKM Profile CRUD - supports 1:N relation
    getMyUMKMProfiles: () => api.get<ApiResponse<UMKMProfile[]>>('/profile/umkm'),
    getUMKMProfile: (id: string) => api.get<ApiResponse<UMKMProfile>>(`/profile/umkm/${id}`),
    createUMKM: (data: unknown) => api.post<ApiResponse<UMKMProfile>>('/profile/umkm', data),
    updateUMKM: (data: unknown) => api.put<ApiResponse<UMKMProfile>>('/profile/umkm', data),
    updateUMKMById: (id: string, data: unknown) => api.put<ApiResponse<UMKMProfile>>(`/profile/umkm/${id}`, data),
    deleteUMKM: (id: string) => api.delete<ApiResponse<{ success: boolean }>>(`/profile/umkm/${id}`),

    // Admin: UMKM Approval Workflow
    getPendingUMKMProfiles: () => api.get<ApiResponse<UMKMProfile[]>>('/profile/umkm-pending'),
    approveUMKM: (id: string) => api.post<ApiResponse<UMKMProfile>>(`/profile/umkm/${id}/approve`, {}),
    rejectUMKM: (id: string, reason: string) => api.post<ApiResponse<UMKMProfile>>(`/profile/umkm/${id}/reject`, { reason }),

    // Mentor Profile
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

