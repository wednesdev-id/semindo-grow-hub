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

    async getAdminOverview() {
        try {
            // Parallel queries for better performance
            const [
                totalUsers,
                totalUMKMProfiles,
                pendingUMKMVerifications,
                totalEnrollments,
                totalOrders,
                totalCourses
            ] = await Promise.all([
                db.user.count(),
                db.uMKMProfile.count(),
                db.uMKMProfile.count({
                    where: {
                        status: { in: ['submitted', 'in_review'] }
                    }
                }),
                db.enrollment.count(),
                db.order.count(),
                db.course.count()
            ]);

            // Calculate active users (users with recent activity)
            // Using a simplified approach: users who have enrollments or orders
            const activeUsersFromEnrollments = await db.enrollment.groupBy({
                by: ['userId'],
                _count: { userId: true }
            });
            const activeUsersFromOrders = await db.order.groupBy({
                by: ['userId'],
                _count: { userId: true }
            });
            const activeUserIds = new Set([
                ...activeUsersFromEnrollments.map(e => e.userId),
                ...activeUsersFromOrders.map(o => o.userId)
            ]);
            const activeUsers = activeUserIds.size;

            // Get user growth data (last 6 months)
            const userGrowth = await this.getUserGrowthData();

            // Get pending UMKM verifications list
            const pendingVerifications = await db.uMKMProfile.findMany({
                where: {
                    status: { in: ['submitted', 'in_review'] }
                },
                include: {
                    user: {
                        select: {
                            fullName: true
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                take: 10
            });

            // Calculate system health
            const systemHealth = this.calculateSystemHealth({
                totalUsers,
                totalUMKMProfiles,
                totalEnrollments,
                totalCourses
            });

            return {
                stats: {
                    totalUsers,
                    activeUsers,
                    pendingVerifications: pendingUMKMVerifications,
                    systemHealth
                },
                userGrowth,
                pendingVerifications: pendingVerifications.map(profile => ({
                    id: profile.id,
                    businessName: profile.businessName,
                    owner: profile.ownerName,
                    date: profile.createdAt.toISOString().split('T')[0],
                    status: profile.status
                })),
                additionalMetrics: {
                    totalUMKMProfiles,
                    totalEnrollments,
                    totalOrders,
                    totalCourses
                }
            };
        } catch (error) {
            console.error('Error in getAdminOverview:', error);
            throw error;
        }
    }

    private async getUserGrowthData(): Promise<{ name: string; users: number }[]> {
        try {
            // Get monthly user registration for last 6 months
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

            // Get all users since 6 months ago
            const users = await db.user.findMany({
                where: {
                    createdAt: { gte: sixMonthsAgo }
                },
                select: { createdAt: true }
            });

            // Group by month
            const monthlyData: { [key: string]: number } = {};
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            users.forEach(user => {
                const month = monthNames[user.createdAt.getMonth()];
                monthlyData[month] = (monthlyData[month] || 0) + 1;
            });

            // Get last 6 months in order
            const result: { name: string; users: number }[] = [];
            const now = new Date();
            for (let i = 5; i >= 0; i--) {
                const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthName = monthNames[date.getMonth()];
                result.push({
                    name: monthName,
                    users: monthlyData[monthName] || 0
                });
            }

            return result;
        } catch (error) {
            console.error('Error in getUserGrowthData:', error);
            // Return empty data on error
            return [
                { name: 'Jan', users: 0 },
                { name: 'Feb', users: 0 },
                { name: 'Mar', users: 0 },
                { name: 'Apr', users: 0 },
                { name: 'May', users: 0 },
                { name: 'Jun', users: 0 }
            ];
        }
    }

    private calculateSystemHealth(metrics: {
        totalUsers: number;
        totalUMKMProfiles: number;
        totalEnrollments: number;
        totalCourses: number;
    }): number {
        let score = 85; // Base score

        // Bonus for active user base
        if (metrics.totalUsers > 100) score += 3;
        if (metrics.totalUsers > 500) score += 3;
        if (metrics.totalUsers > 1000) score += 3;

        // Bonus for UMKM engagement
        if (metrics.totalUMKMProfiles > 50) score += 2;
        if (metrics.totalUMKMProfiles > 200) score += 2;

        // Bonus for learning activity
        if (metrics.totalEnrollments > 100) score += 1;
        if (metrics.totalCourses > 10) score += 1;

        return Math.min(score, 100);
    }
}
