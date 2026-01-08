import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get active consultants with performance metrics
 * GET /api/consultation/admin/consultants/active?page=1&sort=rating|sessions|earnings
 */
export const getActiveConsultants = async (req: Request, res: Response) => {
    try {
        const { page = '1', sort = 'sessions', limit = '20' } = req.query;
        const pageNum = parseInt(page as string);
        const limitNum = parseInt(limit as string);
        const skip = (pageNum - 1) * limitNum;

        let orderBy: any = {};
        switch (sort) {
            case 'rating':
                orderBy = { averageRating: 'desc' };
                break;
            case 'earnings':
                orderBy = { totalEarnings: 'desc' };
                break;
            case 'sessions':
            default:
                orderBy = { totalSessions: 'desc' };
                break;
        }

        const [consultants, totalCount] = await Promise.all([
            prisma.consultantProfile.findMany({
                where: { status: 'approved' },
                select: {
                    id: true,
                    title: true,
                    expertiseAreas: true,
                    yearsExperience: true,
                    hourlyRate: true,
                    totalSessions: true,
                    averageRating: true,
                    totalEarnings: true,
                    isAcceptingNewClients: true,
                    createdAt: true,
                    user: {
                        select: {
                            fullName: true,
                            email: true,
                            profilePictureUrl: true,
                        }
                    },
                    consultationRequests: {
                        where: {
                            status: 'completed'
                        },
                        select: {
                            id: true,
                            createdAt: true,
                        }
                    },
                    reviews: {
                        select: {
                            rating: true,
                            createdAt: true,
                        },
                        orderBy: { createdAt: 'desc' },
                        take: 5
                    }
                },
                orderBy,
                skip,
                take: limitNum
            }),
            prisma.consultantProfile.count({
                where: { status: 'approved' }
            })
        ]);

        // Calculate additional metrics for each consultant
        const consultantsWithMetrics = consultants.map(consultant => {
            // Calculate completion rate
            const completedSessions = consultant.consultationRequests.length;
            const completionRate = consultant.totalSessions > 0
                ? (completedSessions / consultant.totalSessions * 100).toFixed(2)
                : 0;

            // Calculate no-show count (simplified: total - completed)
            const noShowCount = consultant.totalSessions - completedSessions;

            // Calculate last 30 days activity
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            const recentSessions = consultant.consultationRequests.filter(
                r => new Date(r.createdAt) >= thirtyDaysAgo
            ).length;

            return {
                id: consultant.id,
                name: consultant.user.fullName,
                email: consultant.user.email,
                profilePicture: consultant.user.profilePictureUrl,
                title: consultant.title,
                expertise: consultant.expertiseAreas,
                yearsExperience: consultant.yearsExperience,
                hourlyRate: consultant.hourlyRate,
                totalSessions: consultant.totalSessions,
                averageRating: parseFloat((consultant.averageRating || 0).toString()),
                totalEarnings: parseFloat((consultant.totalEarnings || 0).toString()),
                isAcceptingNewClients: consultant.isAcceptingNewClients,
                completionRate: parseFloat(completionRate as string),
                noShowCount,
                recentSessions,
                recentReviews: consultant.reviews.map(r => ({
                    rating: r.rating,
                    date: r.createdAt
                })),
                joinedDate: consultant.createdAt
            };
        });

        res.json({
            consultants: consultantsWithMetrics,
            pagination: {
                page: pageNum,
                limit: limitNum,
                total: totalCount,
                totalPages: Math.ceil(totalCount / limitNum)
            }
        });
    } catch (error) {
        console.error('Error fetching active consultants:', error);
        res.status(500).json({ error: 'Failed to fetch active consultants' });
    }
};

/**
 * Get detailed performance metrics for a specific consultant
 * GET /api/consultation/admin/consultants/:id/performance
 */
export const getConsultantPerformance = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const consultant = await prisma.consultantProfile.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        fullName: true,
                        email: true,
                        phone: true,
                        profilePictureUrl: true
                    }
                },
                consultationRequests: {
                    select: {
                        id: true,
                        status: true,
                        quotedPrice: true,
                        createdAt: true,
                        client: {
                            select: {
                                fullName: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                },
                reviews: {
                    select: {
                        id: true,
                        rating: true,
                        comment: true,
                        createdAt: true,
                        client: {
                            select: {
                                fullName: true
                            }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!consultant) {
            return res.status(404).json({ error: 'Consultant not found' });
        }

        // Calculate performance metrics
        const totalRequests = consultant.consultationRequests.length;
        const completedRequests = consultant.consultationRequests.filter(r => r.status === 'completed').length;
        const pendingRequests = consultant.consultationRequests.filter(r => r.status === 'pending').length;
        const cancelledRequests = consultant.consultationRequests.filter(r => r.status === 'cancelled').length;

        const completionRate = totalRequests > 0
            ? (completedRequests / totalRequests * 100).toFixed(2)
            : 0;

        const cancellationRate = totalRequests > 0
            ? (cancelledRequests / totalRequests * 100).toFixed(2)
            : 0;

        // Revenue breakdown
        const totalRevenue = consultant.consultationRequests
            .filter(r => r.status === 'completed')
            .reduce((sum, r) => sum + parseFloat(r.quotedPrice.toString()), 0);

        // Last 30/60/90 days metrics
        const now = new Date();
        const getLast30Days = (days: number) => {
            const date = new Date(now);
            date.setDate(date.getDate() - days);
            return date;
        };

        const last30DaysRequests = consultant.consultationRequests.filter(
            r => new Date(r.createdAt) >= getLast30Days(30)
        );
        const last60DaysRequests = consultant.consultationRequests.filter(
            r => new Date(r.createdAt) >= getLast30Days(60)
        );
        const last90DaysRequests = consultant.consultationRequests.filter(
            r => new Date(r.createdAt) >= getLast30Days(90)
        );

        // Rating distribution
        const ratingDistribution = {
            5: consultant.reviews.filter(r => r.rating === 5).length,
            4: consultant.reviews.filter(r => r.rating === 4).length,
            3: consultant.reviews.filter(r => r.rating === 3).length,
            2: consultant.reviews.filter(r => r.rating === 2).length,
            1: consultant.reviews.filter(r => r.rating === 1).length,
        };

        res.json({
            consultant: {
                id: consultant.id,
                name: consultant.user.fullName,
                email: consultant.user.email,
                phone: consultant.user.phone,
                profilePicture: consultant.user.profilePictureUrl,
                title: consultant.title,
                bio: consultant.bio,
                expertise: consultant.expertiseAreas,
                yearsExperience: consultant.yearsExperience,
                hourlyRate: consultant.hourlyRate,
                status: consultant.status,
                isAcceptingNewClients: consultant.isAcceptingNewClients,
                joinedDate: consultant.createdAt
            },
            metrics: {
                totalSessions: consultant.totalSessions,
                averageRating: parseFloat((consultant.averageRating || 0).toString()),
                totalEarnings: parseFloat((consultant.totalEarnings || 0).toString()),
                totalRequests,
                completedRequests,
                pendingRequests,
                cancelledRequests,
                completionRate: parseFloat(completionRate as string),
                cancellationRate: parseFloat(cancellationRate as string),
                totalRevenue,
                last30Days: {
                    requests: last30DaysRequests.length,
                    completed: last30DaysRequests.filter(r => r.status === 'completed').length,
                    revenue: last30DaysRequests
                        .filter(r => r.status === 'completed')
                        .reduce((sum, r) => sum + parseFloat(r.quotedPrice.toString()), 0)
                },
                last60Days: {
                    requests: last60DaysRequests.length,
                },
                last90Days: {
                    requests: last90DaysRequests.length,
                },
                ratingDistribution
            },
            recentRequests: consultant.consultationRequests.slice(0, 10).map(r => ({
                id: r.id,
                client: r.client.fullName,
                status: r.status,
                price: parseFloat(r.quotedPrice.toString()),
                date: r.createdAt
            })),
            recentReviews: consultant.reviews.slice(0, 10).map(r => ({
                id: r.id,
                client: r.client.fullName,
                rating: r.rating,
                comment: r.comment,
                date: r.createdAt
            }))
        });
    } catch (error) {
        console.error('Error fetching consultant performance:', error);
        res.status(500).json({ error: 'Failed to fetch consultant performance' });
    }
};

/**
 * Update consultant status (suspend/activate)
 * PATCH /api/consultation/admin/consultants/:id/status
 */
export const updateConsultantStatus = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { status, reason } = req.body;

        if (!['approved', 'suspended'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Must be "approved" or "suspended"' });
        }

        const consultant = await prisma.consultantProfile.update({
            where: { id },
            data: {
                status,
                // You can store the reason in a separate audit log table
            },
            include: {
                user: {
                    select: {
                        fullName: true,
                        email: true
                    }
                }
            }
        });

        res.json({
            success: true,
            message: `Consultant ${status === 'suspended' ? 'suspended' : 'activated'} successfully`,
            consultant: {
                id: consultant.id,
                name: consultant.user.fullName,
                status: consultant.status
            }
        });
    } catch (error) {
        console.error('Error updating consultant status:', error);
        res.status(500).json({ error: 'Failed to update consultant status' });
    }
};
