import { getGlobalApiClient } from '../core/infrastructure/api/ApiClient';

const api = {
    get: async <T>(url: string, options?: any) => {
        const client = getGlobalApiClient();
        const response = await client.get<T>(url, options);
        if (!response.success) throw response.error;
        return response.data as T;
    },
    post: async <T>(url: string, body: any, options?: any) => {
        const client = getGlobalApiClient();
        // Handle FormData: set Content-Type to undefined to let browser set boundary
        const headers = options?.headers || {};
        if (body instanceof FormData) {
            // @ts-ignore - Explicitly set to undefined to override ApiClient default
            headers['Content-Type'] = undefined;
        }

        const response = await client.post<T>(url, body, { ...options, headers });
        if (!response.success) throw response.error;
        return response.data as T;
    },
    patch: async <T>(url: string, body: any, options?: any) => {
        const client = getGlobalApiClient();
        const response = await client.patch<T>(url, body, options);
        if (!response.success) throw response.error;
        return response.data as T;
    },
    delete: async <T>(url: string, options?: any) => {
        const client = getGlobalApiClient();
        const response = await client.delete<T>(url, options);
        if (!response.success) throw response.error;
        return response.data as T;
    }
};

export interface Lesson {
    id: string;
    title: string;
    slug: string;
    type: string; // 'video' | 'pdf' | 'slide' | 'link' | 'article' | 'quiz'
    content?: string;
    videoUrl?: string;
    resourceUrl?: string;
    attachments?: any;
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
    thumbnail?: string;
    thumbnailUrl?: string; // Frontend alias or legacy
    level: string;
    category: string;
    price: number;
    isPublished: boolean;
    isUMKMOnly?: boolean;
    author: {
        id: string;
        fullName: string;
    };
    _count?: {
        modules?: number;
        enrollments?: number;
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

    checkEnrollmentStatus: async (courseId: string) => {
        const response = await api.get<{ data: { isEnrolled: boolean; enrollment?: any } }>(`/lms/courses/${courseId}/enrollment-status`);
        return response.data;
    },

    // Instructor Methods
    getInstructorCourses: async () => {
        const response = await api.get<{ data: Course[] }>('/lms/instructor/courses');
        return response.data;
    },

    getInstructorStats: async () => {
        const response = await api.get<{ data: any }>('/lms/instructor/stats');
        return response.data;
    },

    // Admin Methods
    getAdminStats: async () => {
        // Mock implementation until backend endpoint is ready
        return {
            totalStudents: 1250,
            activeCourses: 15,
            completionRate: 68,
            totalRevenue: 45000000,
            studentTrend: { value: 12, positive: true },
            courseTrend: { value: 5, positive: true },
            completionTrend: { value: 2, positive: true },
            revenueTrend: { value: 8, positive: true },
        };
        // const response = await api.get<{ data: any }>('/lms/admin/stats');
        // return response.data;
    },

    createCourse: async (data: Partial<Course>) => {
        const response = await api.post<{ data: Course }>('/lms/courses', data);
        return response.data;
    },

    updateCourse: async (id: string, data: Partial<Course>) => {
        const response = await api.patch<{ data: Course }>(`/lms/courses/${id}`, data);
        return response.data;
    },

    deleteCourse: async (id: string) => {
        await api.delete(`/lms/courses/${id}`);
    },

    // Module Management
    getAllModules: async () => {
        // Mock implementation for admin view
        return [
            {
                id: "1",
                title: "Introduction to Digital Marketing",
                course: "Digital Marketing 101",
                lessons: 5,
                status: "published",
                updatedAt: "2024-03-10",
            },
            {
                id: "2",
                title: "Social Media Strategies",
                course: "Digital Marketing 101",
                lessons: 8,
                status: "draft",
                updatedAt: "2024-03-12",
            },
            {
                id: "3",
                title: "Financial Planning Basics",
                course: "Finance for UMKM",
                lessons: 4,
                status: "published",
                updatedAt: "2024-03-08",
            },
        ];
        // const response = await api.get<{ data: any[] }>('/lms/admin/modules');
        // return response.data;
    },

    getModules: async (courseId: string) => {
        const response = await api.get<{ data: Module[] }>(`/lms/courses/${courseId}/modules`);
        return response.data;
    },

    createModule: async (courseId: string, data: { title: string; order: number }) => {
        const response = await api.post<{ data: Module }>(`/lms/courses/${courseId}/modules`, data);
        return response.data;
    },

    updateModule: async (moduleId: string, data: { title?: string; order?: number }) => {
        const response = await api.patch<{ data: Module }>(`/lms/modules/${moduleId}`, data);
        return response.data;
    },

    deleteModule: async (moduleId: string) => {
        await api.delete(`/lms/modules/${moduleId}`);
    },

    // Lesson Management
    createLesson: async (moduleId: string, data: Partial<Lesson>) => {
        const response = await api.post<{ data: Lesson }>(`/lms/modules/${moduleId}/lessons`, data);
        return response.data;
    },

    updateLesson: async (lessonId: string, data: Partial<Lesson>) => {
        const response = await api.patch<{ data: Lesson }>(`/lms/lessons/${lessonId}`, data);
        return response.data;
    },

    deleteLesson: async (lessonId: string) => {
        await api.delete(`/lms/lessons/${lessonId}`);
    },

    // Assessment System
    createQuiz: async (lessonId: string, data: any) => {
        const response = await api.post<{ data: any }>(`/lms/lessons/${lessonId}/quiz`, data);
        return response.data;
    },

    getQuiz: async (lessonId: string) => {
        const response = await api.get<{ data: any }>(`/lms/lessons/${lessonId}/quiz`);
        return response.data;
    },

    submitQuiz: async (quizId: string, answers: any) => {
        const response = await api.post<{ data: any }>(`/lms/quizzes/${quizId}/submit`, { answers });
        return response.data;
    },

    getQuizAttempts: async (quizId: string) => {
        const response = await api.get<{ data: any[] }>(`/lms/quizzes/${quizId}/attempts`);
        return response.data;
    },

    createAssignment: async (lessonId: string, data: any) => {
        const response = await api.post<{ data: any }>(`/lms/lessons/${lessonId}/assignment`, data);
        return response.data;
    },

    getAssignment: async (lessonId: string) => {
        const response = await api.get<{ data: any }>(`/lms/lessons/${lessonId}/assignment`);
        return response.data;
    },

    submitAssignment: async (assignmentId: string, data: any) => {
        const response = await api.post<{ data: any }>(`/lms/assignments/${assignmentId}/submit`, data);
        return response.data;
    },

    gradeAssignment: async (submissionId: string, data: { grade: number; feedback?: string }) => {
        const response = await api.post<{ data: any }>(`/lms/submissions/${submissionId}/grade`, data);
        return response.data;
    },

    getAssignmentSubmissions: async (assignmentId: string) => {
        const response = await api.get<{ data: any[] }>(`/lms/assignments/${assignmentId}/submissions`);
        return response.data;
    },

    // Category Management
    getCategories: async () => {
        const response = await api.get<{ data: any[] }>('/lms/categories');
        return response.data;
    },

    createCategory: async (data: { name: string; description?: string }) => {
        const response = await api.post<{ data: any }>('/lms/categories', data);
        return response.data;
    },

    updateCategory: async (id: string, data: { name?: string; description?: string }) => {
        const response = await api.patch<{ data: any }>(`/lms/categories/${id}`, data);
        return response.data;
    },

    deleteCategory: async (id: string) => {
        await api.delete(`/lms/categories/${id}`);
    },

    // Resource Management
    uploadResource: async (file: File) => {
        const client = getGlobalApiClient();
        const response = await client.uploadFile('/lms/resources/upload', file);
        if (!response.success) throw response.error;
        const body = response.data as { data: { url: string } };
        return body.data;
    },
};
