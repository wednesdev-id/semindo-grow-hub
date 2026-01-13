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
    },
    getAdminOverview: async (): Promise<AdminDashboardOverview> => {
        const response = await api.get<AdminDashboardOverview>('/dashboard/admin/overview');
        return response;
    }
};

export interface AdminDashboardOverview {
    stats: {
        totalUsers: number;
        activeUsers: number;
        pendingVerifications: number;
        systemHealth: number;

        // Added fields from backend
        totalOrders: number;
        totalSales: number;
        totalFees: number;
        activeStores: number;
    };
    userGrowth: {
        name: string;
        users: number;
    }[];
    pendingVerifications?: {
        id: string;
        businessName: string;
        owner: string;
        date: string;
        status: string;
    }[];
}
