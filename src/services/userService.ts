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

    delete: async (id: string): Promise<void> => {
        await api.delete(`/users/${id}`);
    },

    // Admin Methods
    getAllUsers: async (): Promise<User[]> => {
        // Mock implementation
        return [
            {
                id: "1",
                fullName: "Budi Santoso",
                email: "budi@example.com",
                roles: ["umkm"],
                isActive: true,
                isVerified: true,
                createdAt: new Date("2024-01-15"),
                updatedAt: new Date(),
            },
            {
                id: "2",
                fullName: "Siti Aminah",
                email: "siti@example.com",
                roles: ["admin"],
                isActive: true,
                isVerified: true,
                createdAt: new Date("2024-02-01"),
                updatedAt: new Date(),
            },
            {
                id: "3",
                fullName: "Rudi Hartono",
                email: "rudi@example.com",
                roles: ["user"],
                isActive: false,
                isVerified: false,
                createdAt: new Date("2024-03-10"),
                updatedAt: new Date(),
            },
        ];
        // const response = await api.get<{ data: User[] }>('/users');
        // return response.data;
    },

    updateUserRole: async (userId: string, role: string) => {
        // Mock implementation
        return { success: true };
        // const response = await api.patch(`/users/${userId}/role`, { role });
        // return response.data;
    },

    getPendingDocuments: async () => {
        // Mock implementation
        return [
            {
                id: "DOC-001",
                user: "Budi Santoso",
                businessName: "UMKM Berkah",
                type: "NIB",
                status: "pending",
                submittedAt: "2024-03-15",
                url: "#",
            },
            {
                id: "DOC-002",
                user: "Siti Aminah",
                businessName: "Batik Solo",
                type: "NPWP",
                status: "pending",
                submittedAt: "2024-03-14",
                url: "#",
            },
        ];
        // const response = await api.get<{ data: any[] }>('/users/documents/pending');
        // return response.data;
    },

    verifyDocument: async (docId: string, approved: boolean) => {
        // Mock implementation
        return { success: true };
        // const response = await api.post(`/users/documents/${docId}/verify`, { approved });
        // return response.data;
    }
};
