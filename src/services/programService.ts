import { api } from './api';
import { ApiResponse } from '@/types/api';

export interface Program {
    id: string;
    title: string;
    description: string;
    type: 'incubator' | 'accelerator' | 'training' | 'coaching';
    status: 'draft' | 'published' | 'archived';
    startDate: string;
    endDate: string;
    registrationDeadline: string;
    quota: number;
    enrolledCount: number;
    location: string;
    image?: string;
    createdAt: string;
    updatedAt: string;
}

export const programService = {
    getAllPrograms: async (): Promise<Program[]> => {
        // Mock implementation
        return [
            {
                id: "1",
                title: "UMKM Go Digital 2024",
                description: "Program intensif transformasi digital untuk UMKM.",
                type: "incubator",
                status: "published",
                startDate: "2024-04-01",
                endDate: "2024-06-30",
                registrationDeadline: "2024-03-25",
                quota: 50,
                enrolledCount: 32,
                location: "Online",
                createdAt: "2024-03-01",
                updatedAt: "2024-03-01",
            },
            {
                id: "2",
                title: "Financial Literacy Workshop",
                description: "Workshop manajemen keuangan dasar.",
                type: "training",
                status: "published",
                startDate: "2024-04-15",
                endDate: "2024-04-15",
                registrationDeadline: "2024-04-10",
                quota: 100,
                enrolledCount: 85,
                location: "Jakarta",
                createdAt: "2024-03-05",
                updatedAt: "2024-03-05",
            },
        ];
        // const response = await api.get<{ data: Program[] }>('/programs');
        // return response.data;
    },

    getProgramById: async (id: string): Promise<Program | undefined> => {
        // Mock implementation
        const programs = await programService.getAllPrograms();
        return programs.find(p => p.id === id);
        // const response = await api.get<{ data: Program }>(`/programs/${id}`);
        // return response.data;
    },

    createProgram: async (data: Partial<Program>) => {
        // Mock implementation
        return { ...data, id: Math.random().toString() };
        // const response = await api.post<{ data: Program }>('/programs', data);
        // return response.data;
    },

    updateProgram: async (id: string, data: Partial<Program>) => {
        // Mock implementation
        return { id, ...data };
        // const response = await api.patch<{ data: Program }>(`/programs/${id}`, data);
        // return response.data;
    },

    deleteProgram: async (id: string) => {
        // Mock implementation
        // await api.delete(`/programs/${id}`);
    }
};
