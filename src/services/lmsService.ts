import { api } from './api';

export interface Course {
    id: string;
    title: string;
    slug: string;
    description: string;
    thumbnailUrl?: string;
    level: string;
    category: string;
    price: number;
    author: {
        fullName: string;
    };
    _count?: {
        modules: number;
    };
}

export const lmsService = {
    getCourses: async (params?: {
        category?: string;
        level?: string;
        search?: string;
    }) => {
        const queryParams = new URLSearchParams();
        if (params?.category) queryParams.append('category', params.category);
        if (params?.level) queryParams.append('level', params.level);
        if (params?.search) queryParams.append('search', params.search);

        const queryString = queryParams.toString();
        const url = `/lms/courses${queryString ? `?${queryString}` : ''}`;

        const response = await api.get<{ data: Course[] }>(url);
        return response.data;
    },

    getCourseBySlug: async (slug: string) => {
        const response = await api.get<{ data: Course }>(`/lms/courses/${slug}`);
        return response.data;
    },
};
