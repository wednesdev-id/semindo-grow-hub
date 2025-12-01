import { db } from '../../utils/db';

export class DashboardService {
    async getOverview(userId: string) {
        // 1. Get Stats
        const [
            totalSalesAgg,
            activeOrdersCount,
            totalProductsCount,
            enrollmentsCount,
            completedEnrollmentsCount,
            certificatesCount
        ] = await Promise.all([
            db.order.aggregate({
                _sum: { totalAmount: true },
                where: { status: 'completed' } // Assuming 'completed' is a valid status
            }),
            db.order.count({
                where: { status: { not: 'completed' } }
            }),
            db.product.count({
                where: { isPublished: true }
            }),
            db.enrollment.count({ where: { userId } }),
            db.enrollment.count({ where: { userId, status: 'completed' } }),
            Promise.resolve(0) // Certificate model not yet implemented
        ]);

        // 2. Get Recent Orders
        const recentOrders = await db.order.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { user: true } // To get customer name
        });

        // 3. Get Sales Chart (Simplified: Last 6 months)
        // Note: Grouping by date in Prisma is tricky without raw SQL. 
        // For MVP, we'll keep the chart data mocked or use a simple raw query if needed.
        // Let's stick to mock chart data for now to avoid complex SQL issues, 
        // but use real totals if possible.
        const salesChart = [
            { name: 'Jan', total: 0 },
            { name: 'Feb', total: 0 },
            { name: 'Mar', total: 0 },
            { name: 'Apr', total: 0 },
            { name: 'May', total: 0 },
            { name: 'Jun', total: totalSalesAgg._sum.totalAmount || 0 }, // Just showing total in last month for now
        ];

        return {
            stats: {
                totalSales: totalSalesAgg._sum.totalAmount || 0,
                activeOrders: activeOrdersCount,
                totalProducts: totalProductsCount,
                averageRating: 4.8 // Placeholder as we don't have ratings table yet
            },
            recentOrders: recentOrders.map(order => ({
                id: order.id,
                customer: order.user.fullName,
                amount: order.totalAmount,
                status: order.status,
                date: order.createdAt.toISOString().split('T')[0]
            })),
            salesChart: salesChart,
            lmsProgress: {
                completedCourses: completedEnrollmentsCount,
                inProgressCourses: enrollmentsCount - completedEnrollmentsCount,
                totalCertificates: certificatesCount
            }
        };
    }
}
