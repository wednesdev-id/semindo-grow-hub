import { api } from './api';

export interface DashboardOverview {
    stats: {
        totalSales: number;
        activeOrders: number;
        totalProducts: number;
        averageRating: number;
    };
    recentOrders: {
        id: string;
        customer: string;
        amount: number;
        status: string;
        date: string;
    }[];
    salesChart: {
        name: string;
        total: number;
    }[];
    lmsProgress: {
        completedCourses: number;
        inProgressCourses: number;
        totalCertificates: number;
    };
}

export const dashboardService = {
    getOverview: async (): Promise<DashboardOverview> => {
        const response = await api.get<DashboardOverview>('/dashboard/overview');
        return response;
    }
};
