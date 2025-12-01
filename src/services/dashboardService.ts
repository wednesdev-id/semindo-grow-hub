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
        // Mock data for now
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    stats: {
                        totalUsers: 1250,
                        activeUsers: 850,
                        pendingVerifications: 15,
                        systemHealth: 98
                    },
                    userGrowth: [
                        { name: 'Jan', users: 400 },
                        { name: 'Feb', users: 600 },
                        { name: 'Mar', users: 800 },
                        { name: 'Apr', users: 1000 },
                        { name: 'May', users: 1150 },
                        { name: 'Jun', users: 1250 },
                    ],
                    pendingVerifications: [
                        { id: '1', businessName: 'Warung Makan Sejahtera', owner: 'Budi Santoso', date: '2024-06-01', status: 'pending' },
                        { id: '2', businessName: 'Kerajinan Bambu Jaya', owner: 'Siti Aminah', date: '2024-06-02', status: 'pending' },
                        { id: '3', businessName: 'Toko Kelontong Berkah', owner: 'Ahmad Hidayat', date: '2024-06-03', status: 'pending' },
                    ]
                });
            }, 500);
        });
    }
};

export interface AdminDashboardOverview {
    stats: {
        totalUsers: number;
        activeUsers: number;
        pendingVerifications: number;
        systemHealth: number;
    };
    userGrowth: {
        name: string;
        users: number;
    }[];
    pendingVerifications: {
        id: string;
        businessName: string;
        owner: string;
        date: string;
        status: string;
    }[];
}
