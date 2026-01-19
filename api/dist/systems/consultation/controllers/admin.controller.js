"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllRequests = exports.getRecentActivities = exports.getExpertiseDistribution = exports.getTopConsultants = exports.getAnalyticsTrends = exports.getStatsOverview = void 0;
const client_1 = require("../../../../prisma/generated/client");
const prisma = new client_1.PrismaClient();
/**
 * Get admin dashboard statistics overview
 * GET /api/consultation/admin/stats/overview
 */
const getStatsOverview = async (req, res) => {
    try {
        // Consultant stats
        const totalConsultants = await prisma.consultantProfile.count();
        const pendingConsultants = await prisma.consultantProfile.count({
            where: { status: 'pending' }
        });
        const activeConsultants = await prisma.consultantProfile.count({
            where: { status: 'approved' }
        });
        const suspendedConsultants = await prisma.consultantProfile.count({
            where: { status: 'suspended' }
        });
        // Request stats
        const totalRequests = await prisma.consultationRequest.count();
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const requestsToday = await prisma.consultationRequest.count({
            where: {
                createdAt: {
                    gte: today,
                    lt: tomorrow
                }
            }
        });
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const requestsThisMonth = await prisma.consultationRequest.count({
            where: {
                createdAt: {
                    gte: firstDayOfMonth
                }
            }
        });
        const pendingRequests = await prisma.consultationRequest.count({
            where: { status: 'pending' }
        });
        const approvedRequests = await prisma.consultationRequest.count({
            where: { status: 'approved' }
        });
        const completedRequests = await prisma.consultationRequest.count({
            where: { status: 'completed' }
        });
        const cancelledRequests = await prisma.consultationRequest.count({
            where: { status: 'cancelled' }
        });
        // Calculate average rating
        const consultantsWithRating = await prisma.consultantProfile.findMany({
            where: { status: 'approved' },
            select: { averageRating: true }
        });
        let averageRating = 0;
        if (consultantsWithRating.length > 0) {
            const totalRating = consultantsWithRating.reduce((sum, c) => sum + (c.averageRating || 0), 0);
            averageRating = totalRating / consultantsWithRating.length;
        }
        // Calculate response rate (simplified - would need more complex query in production)
        // For now, assume 100% response rate
        const responseRate = 100;
        // Calculate completion rate
        const completionRate = totalRequests > 0
            ? (completedRequests / totalRequests * 100).toFixed(2)
            : 0;
        // Calculate no-show rate (cancelled / total * 100)
        const noShowRate = totalRequests > 0
            ? (cancelledRequests / totalRequests * 100).toFixed(2)
            : 0;
        res.json({
            consultants: {
                total: totalConsultants,
                active: activeConsultants,
                pending: pendingConsultants,
                suspended: suspendedConsultants
            },
            requests: {
                total: totalRequests,
                today: requestsToday,
                thisMonth: requestsThisMonth,
                pending: pendingRequests,
                approved: approvedRequests,
                completed: completedRequests,
                cancelled: cancelledRequests
            },
            revenue: {
                total: 0, // TODO: Implement when revenue tracking is added
                today: 0,
                thisMonth: 0,
                platformFee: 0
            },
            quality: {
                averageRating: parseFloat(averageRating.toFixed(2)),
                responseRate: responseRate,
                completionRate: parseFloat(completionRate),
                noShowRate: parseFloat(noShowRate)
            }
        });
    }
    catch (error) {
        console.error('Error fetching stats overview:', error);
        res.status(500).json({ error: 'Failed to fetch statistics' });
    }
};
exports.getStatsOverview = getStatsOverview;
/**
 * Get analytics trends
 * GET /api/consultation/admin/analytics/trends?period=7d|30d|90d
 */
const getAnalyticsTrends = async (req, res) => {
    try {
        const { period = '7d' } = req.query;
        // Calculate date range
        const daysMap = { '7d': 7, '30d': 30, '90d': 90 };
        const days = daysMap[period] || 7;
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        // Get requests grouped by date
        const requests = await prisma.consultationRequest.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            },
            select: {
                createdAt: true,
                status: true,
                quotedPrice: true
            },
            orderBy: { createdAt: 'asc' }
        });
        // Group by date
        const trendsByDate = {};
        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            trendsByDate[dateStr] = { count: 0, completed: 0, revenue: 0 };
        }
        requests.forEach(req => {
            const dateStr = req.createdAt.toISOString().split('T')[0];
            if (trendsByDate[dateStr]) {
                trendsByDate[dateStr].count++;
                if (req.status === 'completed') {
                    trendsByDate[dateStr].completed++;
                    trendsByDate[dateStr].revenue += parseFloat(req.quotedPrice.toString());
                }
            }
        });
        const requestTrends = Object.entries(trendsByDate).map(([date, data]) => ({
            date,
            count: data.count
        }));
        const revenueTrends = Object.entries(trendsByDate).map(([date, data]) => ({
            date,
            amount: data.revenue
        }));
        const completionRate = Object.entries(trendsByDate).map(([date, data]) => ({
            date,
            rate: data.count > 0 ? (data.completed / data.count * 100).toFixed(2) : 0
        }));
        res.json({
            requestTrends,
            revenueTrends,
            completionRate
        });
    }
    catch (error) {
        console.error('Error fetching analytics trends:', error);
        res.status(500).json({ error: 'Failed to fetch trends' });
    }
};
exports.getAnalyticsTrends = getAnalyticsTrends;
/**
 * Get top consultants
 * GET /api/consultation/admin/analytics/top-consultants?metric=sessions|rating|revenue&limit=10
 */
const getTopConsultants = async (req, res) => {
    try {
        const { metric = 'sessions', limit = '10' } = req.query;
        const limitNum = parseInt(limit);
        let orderBy = {};
        let valueField = '';
        switch (metric) {
            case 'rating':
                orderBy = { averageRating: 'desc' };
                valueField = 'averageRating';
                break;
            case 'revenue':
                orderBy = { totalEarnings: 'desc' };
                valueField = 'totalEarnings';
                break;
            case 'sessions':
            default:
                orderBy = { totalSessions: 'desc' };
                valueField = 'totalSessions';
                break;
        }
        const consultants = await prisma.consultantProfile.findMany({
            where: { status: 'approved' },
            select: {
                id: true,
                user: {
                    select: {
                        fullName: true,
                        profilePictureUrl: true
                    }
                },
                totalSessions: true,
                averageRating: true,
                totalEarnings: true
            },
            orderBy,
            take: limitNum
        });
        const result = consultants.map((c, index) => ({
            id: c.id,
            name: c.user.fullName,
            profilePicture: c.user.profilePictureUrl,
            value: valueField === 'averageRating'
                ? parseFloat((c.averageRating || 0).toString())
                : valueField === 'totalEarnings'
                    ? parseFloat((c.totalEarnings || 0).toString())
                    : c.totalSessions,
            rank: index + 1
        }));
        res.json({ consultants: result, metric });
    }
    catch (error) {
        console.error('Error fetching top consultants:', error);
        res.status(500).json({ error: 'Failed to fetch top consultants' });
    }
};
exports.getTopConsultants = getTopConsultants;
/**
 * Get expertise distribution
 * GET /api/consultation/admin/analytics/expertise-distribution
 */
const getExpertiseDistribution = async (req, res) => {
    try {
        // Get all consultants with their expertise areas
        const consultants = await prisma.consultantProfile.findMany({
            where: { status: 'approved' },
            select: { expertiseAreas: true }
        });
        // Count by expertise
        const expertiseCounts = {};
        consultants.forEach(consultant => {
            consultant.expertiseAreas.forEach(expertise => {
                expertiseCounts[expertise] = (expertiseCounts[expertise] || 0) + 1;
            });
        });
        const totalCount = consultants.length;
        const expertise = Object.entries(expertiseCounts)
            .map(([name, count]) => ({
            name,
            count,
            percentage: totalCount > 0
                ? parseFloat(((count / totalCount) * 100).toFixed(2))
                : 0
        }))
            .sort((a, b) => b.count - a.count);
        res.json({ expertise, total: totalCount });
    }
    catch (error) {
        console.error('Error fetching expertise distribution:', error);
        res.status(500).json({ error: 'Failed to fetch expertise distribution' });
    }
};
exports.getExpertiseDistribution = getExpertiseDistribution;
/**
 * Get recent activities
 * GET /api/consultation/admin/activities/recent?limit=10
 */
const getRecentActivities = async (req, res) => {
    try {
        const { limit = '10' } = req.query;
        const limitNum = parseInt(limit);
        // Get recent requests
        const recentRequests = await prisma.consultationRequest.findMany({
            take: limitNum,
            orderBy: { createdAt: 'desc' },
            include: {
                client: {
                    select: {
                        fullName: true,
                        profilePictureUrl: true
                    }
                },
                consultant: {
                    select: {
                        user: {
                            select: {
                                fullName: true
                            }
                        }
                    }
                }
            }
        });
        // Get recent consultant registrations
        const recentConsultants = await prisma.consultantProfile.findMany({
            take: Math.min(5, limitNum),
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        fullName: true,
                        profilePictureUrl: true
                    }
                }
            }
        });
        // Get recent reviews
        const recentReviews = await prisma.consultationReview.findMany({
            take: Math.min(5, limitNum),
            orderBy: { createdAt: 'desc' },
            include: {
                client: {
                    select: {
                        fullName: true
                    }
                },
                consultant: {
                    select: {
                        user: {
                            select: {
                                fullName: true
                            }
                        }
                    }
                }
            }
        });
        // Combine and sort all activities
        const activities = [];
        recentRequests.forEach(req => {
            activities.push({
                id: req.id,
                timestamp: req.createdAt,
                type: 'request',
                activityType: `Request ${req.status}`,
                userName: req.client.fullName,
                userAvatar: req.client.profilePictureUrl,
                details: `${req.topic} with ${req.consultant.user.fullName}`,
                status: req.status,
                entityType: 'consultation_request',
                entityId: req.id
            });
        });
        recentConsultants.forEach(consultant => {
            activities.push({
                id: consultant.id,
                timestamp: consultant.createdAt,
                type: 'consultant_registration',
                activityType: 'New Consultant',
                userName: consultant.user.fullName,
                userAvatar: consultant.user.profilePictureUrl,
                details: `Submitted profile for approval`,
                status: consultant.status,
                entityType: 'consultant_profile',
                entityId: consultant.id
            });
        });
        recentReviews.forEach(review => {
            activities.push({
                id: review.id,
                timestamp: review.createdAt,
                type: 'review',
                activityType: 'Review Posted',
                userName: review.client.fullName,
                details: `${review.rating}⭐ to ${review.consultant.user.fullName}`,
                status: 'completed',
                entityType: 'consultation_review',
                entityId: review.id
            });
        });
        // Sort by timestamp desc and limit
        activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        const limitedActivities = activities.slice(0, limitNum);
        res.json({ activities: limitedActivities });
    }
    catch (error) {
        console.error('Error fetching recent activities:', error);
        res.status(500).json({ error: 'Failed to fetch recent activities' });
    }
};
exports.getRecentActivities = getRecentActivities;
/**
 * Get all consultation requests for admin
 * GET /api/consultation/admin/requests
 */
const getAllRequests = async (req, res) => {
    try {
        const { status, page = '1', limit = '100' } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        const whereClause = {};
        if (status && status !== 'all') {
            whereClause.status = status;
        }
        const [requests, totalCount] = await Promise.all([
            prisma.consultationRequest.findMany({
                where: whereClause,
                select: {
                    id: true,
                    topic: true,
                    requestedDate: true,
                    requestedStartTime: true,
                    requestedEndTime: true,
                    durationMinutes: true,
                    status: true,
                    quotedPrice: true,
                    createdAt: true,
                    updatedAt: true,
                    client: {
                        select: {
                            fullName: true,
                            email: true,
                            profilePictureUrl: true
                        }
                    },
                    consultant: {
                        select: {
                            id: true,
                            user: {
                                select: {
                                    fullName: true
                                }
                            }
                        }
                    }
                },
                orderBy: { createdAt: 'desc' },
                skip,
                take: limitNum
            }),
            prisma.consultationRequest.count({ where: whereClause })
        ]);
        res.json({
            requests,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limitNum)
            }
        });
    }
    catch (error) {
        console.error('Error fetching all requests:', error);
        res.status(500).json({ error: 'Failed to fetch requests' });
    }
};
exports.getAllRequests = getAllRequests;
