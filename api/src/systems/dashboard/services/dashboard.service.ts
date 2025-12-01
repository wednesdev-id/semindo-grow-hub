import { db } from '../../utils/db';

export class DashboardService {
    async getOverview(userId: string) {
        // In a real app, we would fetch this from the database
        // For now, we'll return mock data that looks realistic

        return {
            stats: {
                totalSales: 15000000,
                activeOrders: 12,
                totalProducts: 45,
                averageRating: 4.8
            },
            recentOrders: [
                { id: 'ORD-001', customer: 'Budi Santoso', amount: 150000, status: 'completed', date: '2024-03-10' },
                { id: 'ORD-002', customer: 'Siti Aminah', amount: 250000, status: 'processing', date: '2024-03-11' },
                { id: 'ORD-003', customer: 'Rudi Hermawan', amount: 75000, status: 'pending', date: '2024-03-12' },
            ],
            salesChart: [
                { name: 'Jan', total: 2500000 },
                { name: 'Feb', total: 3500000 },
                { name: 'Mar', total: 4500000 },
                { name: 'Apr', total: 4000000 },
                { name: 'May', total: 5500000 },
                { name: 'Jun', total: 6000000 },
            ],
            lmsProgress: {
                completedCourses: 2,
                inProgressCourses: 1,
                totalCertificates: 2
            }
        };
    }
}
