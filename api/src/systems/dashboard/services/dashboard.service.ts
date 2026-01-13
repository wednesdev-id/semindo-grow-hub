import { db } from '../../utils/db';

export class DashboardService {
    async getOverview(userId: string) {
        // Get user's store to filter products correctly
        const store = await db.store.findFirst({ where: { userId } });
        const storeId = store?.id;

        // Base filter for products (ownership and not deleted)
        // This matches marketplace.service.ts getMyProducts logic
        const productWhereInput: any = {
            OR: [
                storeId ? { storeId } : {},
                { sellerId: userId }
            ],
            deletedAt: null
        };

        // Filter for orders that contain this seller's products
        const orderWhereInput: any = {
            items: {
                some: {
                    product: {
                        OR: [
                            storeId ? { storeId } : {},
                            { sellerId: userId }
                        ]
                    }
                }
            }
        };

        // 1. Get Stats (Parallel)
        const [
            totalProductsCount,
            activeOrdersCount,
            enrollmentsCount,
            completedEnrollmentsCount
        ] = await Promise.all([
            // Fix: Filter products by owner instead of just isPublished
            db.product.count({
                where: productWhereInput
            }),
            // Fix: Filter orders by seller's items
            db.order.count({
                where: {
                    ...orderWhereInput,
                    // Active orders are those in progress (not delivered, cancelled, or failed)
                    status: { notIn: ['delivered', 'cancelled', 'failed'] }
                }
            }),
            db.enrollment.count({ where: { userId } }),
            db.enrollment.count({ where: { userId, status: 'completed' } })
        ]);

        // Use completed enrollments as proxy for certificates for now
        const certificatesCount = completedEnrollmentsCount;

        // Calculate Total Sales specifically for this seller
        // We need to sum (price * quantity) of items in completed orders for this seller
        const completedOrders = await db.order.findMany({
            where: {
                ...orderWhereInput,
                status: 'delivered' // Use 'delivered' as the success status
            },
            include: {
                items: {
                    include: { product: true }
                }
            }
        });

        let totalSales = 0;
        for (const order of completedOrders) {
            for (const item of order.items) {
                // Check if item belongs to this seller
                const isSellerProduct = item.product.sellerId === userId || (storeId && item.product.storeId === storeId);
                if (isSellerProduct) {
                    totalSales += Number(item.price) * item.quantity;
                }
            }
        }

        // 2. Get Recent Orders (filtered)
        const recentOrders = await db.order.findMany({
            take: 5,
            where: orderWhereInput,
            orderBy: { createdAt: 'desc' },
            include: { user: true }
        });

        // 3. Get Sales Chart (Real Data: Last 6 months)
        const salesChart = await this.getSalesChartData(userId, storeId);

        // 4. Calculate Average Rating (Real Data)
        let averageRating = 0;
        const reviewsAggregate = await db.review.aggregate({
            where: {
                OR: [
                    storeId ? { storeId } : {},
                    { product: { sellerId: userId } }
                ]
            },
            _avg: {
                rating: true
            }
        });

        if (reviewsAggregate._avg.rating) {
            averageRating = Number(reviewsAggregate._avg.rating.toFixed(1));
        }

        return {
            stats: {
                totalSales: totalSales,
                activeOrders: activeOrdersCount,
                totalProducts: totalProductsCount,
                averageRating: averageRating
            },
            recentOrders: recentOrders.map(order => ({
                id: order.id,
                customer: order.user.fullName,
                amount: order.totalAmount, // Note: showing total order amount, might want seller subtotal in future
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

    private async getSalesChartData(userId: string, storeId?: string): Promise<{ name: string; total: number }[]> {
        try {
            const sixMonthsAgo = new Date();
            sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5); // Go back 5 months to include current month = 6 months total
            sixMonthsAgo.setDate(1); // Start from beginning of that month
            sixMonthsAgo.setHours(0, 0, 0, 0);

            // Get all delivered orders from last 6 months involving this seller
            const orders = await db.order.findMany({
                where: {
                    createdAt: { gte: sixMonthsAgo },
                    status: 'delivered',
                    items: {
                        some: {
                            product: {
                                OR: [
                                    storeId ? { storeId } : {},
                                    { sellerId: userId }
                                ]
                            }
                        }
                    }
                },
                include: {
                    items: {
                        include: { product: true }
                    }
                }
            });

            // Initialize monthly data
            const monthlyData: { [key: string]: number } = {};
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

            // Populate all 6 months with 0 first
            const now = new Date();
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthName = monthNames[d.getMonth()];
                monthlyData[monthName] = 0;
            }

            // Aggregate sales
            for (const order of orders) {
                const monthIndex = order.createdAt.getMonth();
                const monthName = monthNames[monthIndex];

                let orderTotalForSeller = 0;
                for (const item of order.items) {
                    const isSellerProduct = item.product.sellerId === userId || (storeId && item.product.storeId === storeId);
                    if (isSellerProduct) {
                        orderTotalForSeller += Number(item.price) * item.quantity;
                    }
                }

                if (monthlyData[monthName] !== undefined) {
                    monthlyData[monthName] += orderTotalForSeller;
                }
            }

            // Format result
            const result: { name: string; total: number }[] = [];
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const monthName = monthNames[d.getMonth()];
                result.push({
                    name: monthName,
                    total: monthlyData[monthName] || 0
                });
            }

            return result;
        } catch (error) {
            console.error('Error calculating sales chart:', error);
            // Fallback to empty chart
            const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            const result: { name: string; total: number }[] = [];
            const now = new Date();
            for (let i = 5; i >= 0; i--) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                result.push({ name: monthNames[d.getMonth()], total: 0 });
            }
            return result;
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
