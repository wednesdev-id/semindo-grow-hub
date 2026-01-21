"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportReport = exports.getKPIMetrics = exports.getRevenueTrends = exports.getRevenueSummary = void 0;
const prisma_1 = require("../../../lib/prisma");
/**
 * Get revenue summary
 * GET /api/consultation/admin/revenue/summary?period=7d|30d|90d|all
 */
const getRevenueSummary = async (req, res) => {
    try {
        const { period = '30d' } = req.query;
        // Calculate date range
        const daysMap = { '7d': 7, '30d': 30, '90d': 90, 'all': null };
        const days = daysMap[period];
        const dateFilter = days ? {
            createdAt: {
                gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
            }
        } : {};
        // Get completed requests with revenue
        const completedRequests = await prisma_1.prisma.consultationRequest.findMany({
            where: {
                status: 'completed',
                ...dateFilter
            },
            select: {
                quotedPrice: true,
                createdAt: true,
                consultant: {
                    select: {
                        id: true,
                        user: { select: { fullName: true } }
                    }
                }
            }
        });
        // Calculate totals
        const totalRevenue = completedRequests.reduce((sum, r) => sum + parseFloat(r.quotedPrice.toString()), 0);
        // Platform fee (assume 10%)
        const platformFeeRate = 0.10;
        const platformFee = totalRevenue * platformFeeRate;
        const consultantPayouts = totalRevenue - platformFee;
        // Today's revenue
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayRevenue = completedRequests
            .filter(r => new Date(r.createdAt) >= today)
            .reduce((sum, r) => sum + parseFloat(r.quotedPrice.toString()), 0);
        // This month's revenue
        const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthRevenue = completedRequests
            .filter(r => new Date(r.createdAt) >= firstOfMonth)
            .reduce((sum, r) => sum + parseFloat(r.quotedPrice.toString()), 0);
        // Revenue by consultant
        const revenueByConsultant = {};
        completedRequests.forEach(r => {
            const id = r.consultant.id;
            if (!revenueByConsultant[id]) {
                revenueByConsultant[id] = {
                    name: r.consultant.user.fullName,
                    revenue: 0,
                    sessions: 0
                };
            }
            revenueByConsultant[id].revenue += parseFloat(r.quotedPrice.toString());
            revenueByConsultant[id].sessions++;
        });
        const topEarners = Object.entries(revenueByConsultant)
            .map(([id, data]) => ({ id, ...data }))
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, 10);
        res.json({
            summary: {
                totalRevenue,
                platformFee,
                consultantPayouts,
                todayRevenue,
                monthRevenue,
                totalSessions: completedRequests.length,
                platformFeeRate: platformFeeRate * 100
            },
            topEarners,
            period
        });
    }
    catch (error) {
        console.error('Error fetching revenue summary:', error);
        res.status(500).json({ error: 'Failed to fetch revenue summary' });
    }
};
exports.getRevenueSummary = getRevenueSummary;
/**
 * Get revenue trends over time
 * GET /api/consultation/admin/revenue/trends?period=7d|30d|90d
 */
const getRevenueTrends = async (req, res) => {
    try {
        const { period = '30d' } = req.query;
        const daysMap = { '7d': 7, '30d': 30, '90d': 90 };
        const days = daysMap[period] || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        const completedRequests = await prisma_1.prisma.consultationRequest.findMany({
            where: {
                status: 'completed',
                createdAt: { gte: startDate }
            },
            select: {
                quotedPrice: true,
                createdAt: true
            },
            orderBy: { createdAt: 'asc' }
        });
        // Group by date
        const trendsByDate = {};
        for (let i = 0; i < days; i++) {
            const date = new Date(startDate);
            date.setDate(date.getDate() + i);
            const dateStr = date.toISOString().split('T')[0];
            trendsByDate[dateStr] = { revenue: 0, sessions: 0 };
        }
        completedRequests.forEach(r => {
            const dateStr = r.createdAt.toISOString().split('T')[0];
            if (trendsByDate[dateStr]) {
                trendsByDate[dateStr].revenue += parseFloat(r.quotedPrice.toString());
                trendsByDate[dateStr].sessions++;
            }
        });
        const trends = Object.entries(trendsByDate).map(([date, data]) => ({
            date,
            revenue: data.revenue,
            sessions: data.sessions
        }));
        res.json({ trends, period });
    }
    catch (error) {
        console.error('Error fetching revenue trends:', error);
        res.status(500).json({ error: 'Failed to fetch revenue trends' });
    }
};
exports.getRevenueTrends = getRevenueTrends;
/**
 * Get KPI metrics
 * GET /api/consultation/admin/kpi
 */
const getKPIMetrics = async (req, res) => {
    try {
        // Get all-time stats
        const [totalConsultants, activeConsultants, totalRequests, completedRequests, cancelledRequests, pendingRequests] = await Promise.all([
            prisma_1.prisma.consultantProfile.count(),
            prisma_1.prisma.consultantProfile.count({ where: { status: 'approved' } }),
            prisma_1.prisma.consultationRequest.count(),
            prisma_1.prisma.consultationRequest.count({ where: { status: 'completed' } }),
            prisma_1.prisma.consultationRequest.count({ where: { status: 'cancelled' } }),
            prisma_1.prisma.consultationRequest.count({ where: { status: 'pending' } })
        ]);
        // Last 30 days comparison
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const sixtyDaysAgo = new Date();
        sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
        const [last30DaysRequests, prev30DaysRequests] = await Promise.all([
            prisma_1.prisma.consultationRequest.count({
                where: { createdAt: { gte: thirtyDaysAgo } }
            }),
            prisma_1.prisma.consultationRequest.count({
                where: {
                    createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo }
                }
            })
        ]);
        // Calculate rates
        const consultantActivationRate = totalConsultants > 0
            ? (activeConsultants / totalConsultants * 100).toFixed(2)
            : 0;
        const requestFulfillmentRate = totalRequests > 0
            ? (completedRequests / totalRequests * 100).toFixed(2)
            : 0;
        const cancellationRate = totalRequests > 0
            ? (cancelledRequests / totalRequests * 100).toFixed(2)
            : 0;
        const requestGrowth = prev30DaysRequests > 0
            ? (((last30DaysRequests - prev30DaysRequests) / prev30DaysRequests) * 100).toFixed(2)
            : last30DaysRequests > 0 ? 100 : 0;
        // Average rating
        const consultantsWithRating = await prisma_1.prisma.consultantProfile.findMany({
            where: { status: 'approved' },
            select: { averageRating: true }
        });
        const avgRating = consultantsWithRating.length > 0
            ? consultantsWithRating.reduce((sum, c) => sum + (c.averageRating || 0), 0) / consultantsWithRating.length
            : 0;
        res.json({
            kpis: {
                consultantActivationRate: parseFloat(consultantActivationRate),
                requestFulfillmentRate: parseFloat(requestFulfillmentRate),
                cancellationRate: parseFloat(cancellationRate),
                averageRating: parseFloat(avgRating.toFixed(2)),
                requestGrowth: parseFloat(requestGrowth)
            },
            counts: {
                totalConsultants,
                activeConsultants,
                totalRequests,
                completedRequests,
                cancelledRequests,
                pendingRequests,
                last30DaysRequests
            }
        });
    }
    catch (error) {
        console.error('Error fetching KPI metrics:', error);
        res.status(500).json({ error: 'Failed to fetch KPI metrics' });
    }
};
exports.getKPIMetrics = getKPIMetrics;
/**
 * Export report data
 * POST /api/consultation/admin/reports/export
 */
const exportReport = async (req, res) => {
    try {
        const { type = 'revenue', period = '30d', format = 'json' } = req.body;
        const daysMap = { '7d': 7, '30d': 30, '90d': 90 };
        const days = daysMap[period] || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        let data = {};
        if (type === 'revenue') {
            const requests = await prisma_1.prisma.consultationRequest.findMany({
                where: {
                    status: 'completed',
                    createdAt: { gte: startDate }
                },
                select: {
                    id: true,
                    topic: true,
                    quotedPrice: true,
                    createdAt: true,
                    client: { select: { fullName: true, email: true } },
                    consultant: { select: { user: { select: { fullName: true } } } }
                },
                orderBy: { createdAt: 'desc' }
            });
            data = {
                reportType: 'Revenue Report',
                period: `Last ${days} days`,
                generatedAt: new Date().toISOString(),
                totalRecords: requests.length,
                totalRevenue: requests.reduce((sum, r) => sum + parseFloat(r.quotedPrice.toString()), 0),
                records: requests.map(r => ({
                    id: r.id,
                    date: r.createdAt,
                    client: r.client.fullName,
                    clientEmail: r.client.email,
                    consultant: r.consultant.user.fullName,
                    topic: r.topic,
                    amount: parseFloat(r.quotedPrice.toString())
                }))
            };
        }
        else if (type === 'consultants') {
            const consultants = await prisma_1.prisma.consultantProfile.findMany({
                where: { status: 'approved' },
                select: {
                    id: true,
                    title: true,
                    expertiseAreas: true,
                    totalSessions: true,
                    averageRating: true,
                    totalEarnings: true,
                    createdAt: true,
                    user: { select: { fullName: true, email: true } }
                },
                orderBy: { totalSessions: 'desc' }
            });
            data = {
                reportType: 'Consultant Performance Report',
                generatedAt: new Date().toISOString(),
                totalRecords: consultants.length,
                records: consultants.map(c => ({
                    id: c.id,
                    name: c.user.fullName,
                    email: c.user.email,
                    title: c.title,
                    expertise: c.expertiseAreas.join(', '),
                    sessions: c.totalSessions,
                    rating: c.averageRating,
                    earnings: c.totalEarnings,
                    joinedDate: c.createdAt
                }))
            };
        }
        if (format === 'csv') {
            // Convert to CSV
            const records = data.records || [];
            if (records.length === 0) {
                return res.status(200).send('No data to export');
            }
            const headers = Object.keys(records[0]).join(',');
            const rows = records.map((r) => Object.values(r).map(v => typeof v === 'string' ? `"${v}"` : v).join(','));
            const csv = [headers, ...rows].join('\n');
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', `attachment; filename=${type}-report-${period}.csv`);
            return res.send(csv);
        }
        res.json(data);
    }
    catch (error) {
        console.error('Error exporting report:', error);
        res.status(500).json({ error: 'Failed to export report' });
    }
};
exports.exportReport = exportReport;
