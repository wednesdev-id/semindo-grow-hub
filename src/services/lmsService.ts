import { api } from './api';

export interface Lesson {
    id: string;
    title: string;
    slug: string;
    content?: string;
    videoUrl?: string;
    duration?: number;
    order: number;
    isFree: boolean;
}

export interface Module {
    id: string;
    title: string;
    order: number;
    lessons: Lesson[];
}

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
    modules?: Module[];
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

    enroll: async (courseId: string) => {
        const response = await api.post<{ data: any }>(`/lms/courses/${courseId}/enroll`, {});
        return response.data;
    },

    getMyCourses: async () => {
        const response = await api.get<{ data: any[] }>('/lms/my-courses');
        return response.data;
    },

    updateProgress: async (lessonId: string, completed: boolean) => {
        const response = await api.patch<{ data: any }>(`/lms/lessons/${lessonId}/progress`, { completed });
        return response.data;
    },
};
