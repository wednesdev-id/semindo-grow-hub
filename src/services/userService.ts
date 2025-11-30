import { api } from './api';
import { User } from '@/types/auth';

export interface UserQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
}

import { PaginatedResponse, ApiResponse } from '@/types/api';

export const userService = {
    findAll: (params?: UserQueryParams) => {
        const query = new URLSearchParams();
        if (params?.page) query.append('page', params.page.toString());
        if (params?.limit) query.append('limit', params.limit.toString());
        if (params?.search) query.append('search', params.search);
        if (params?.role) query.append('role', params.role);

        return api.get<PaginatedResponse<User>>(`/users?${query.toString()}`);
    },

    findById: (id: string) => api.get<ApiResponse<User>>(`/users/${id}`),

    create: (data: Partial<User>) => api.post<ApiResponse<User>>('/users', data),

    update: (id: string, data: Partial<User>) => api.patch<ApiResponse<User>>(`/users/${id}`, data),

    delete: (id: string) => api.delete<ApiResponse<void>>(`/users/${id}`),
};
