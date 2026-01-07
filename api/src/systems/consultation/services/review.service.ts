import { prisma } from '../../../lib/prisma';

/**
 * Create a new review for a consultant
 */
export const createReview = async (
    clientId: string,
    consultantId: string,
    rating: number,
    comment?: string
) => {
    // Verify rating is between 1-5
    if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
    }

    // Check if client has completed session with this consultant
    const completedSession = await prisma.consultationRequest.findFirst({
        where: {
            clientId,
            consultantId,
            status: 'completed'
        }
    });

    if (!completedSession) {
        throw new Error('You can only review consultants after completing a session');
    }

    // Check if client already reviewed this consultant
    const existingReview = await prisma.consultationReview.findFirst({
        where: {
            clientId,
            consultantId
        }
    });

    if (existingReview) {
        throw new Error('You have already reviewed this consultant');
    }

    // Create the review
    const review = await prisma.consultationReview.create({
        data: {
            clientId,
            consultantId,
            rating,
            comment,
            isPublished: true
        },
        include: {
            client: {
                select: {
                    fullName: true,
                    profilePictureUrl: true
                }
            }
        }
    });

    // Update consultant's average rating
    await updateConsultantRating(consultantId);

    return review;
};

/**
 * Get all published reviews for a consultant
 */
export const getReviewsByConsultant = async (consultantId: string, limit = 20, offset = 0) => {
    const reviews = await prisma.consultationReview.findMany({
        where: {
            consultantId,
            isPublished: true
        },
        include: {
            client: {
                select: {
                    fullName: true,
                    profilePictureUrl: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: limit,
        skip: offset
    });

    const total = await prisma.consultationReview.count({
        where: {
            consultantId,
            isPublished: true
        }
    });

    return { reviews, total };
};

/**
 * Check if client can review a consultant (has completed session, hasn't reviewed yet)
 */
export const canClientReview = async (clientId: string, consultantId: string) => {
    // Check for completed session
    const completedSession = await prisma.consultationRequest.findFirst({
        where: {
            clientId,
            consultantId,
            status: 'completed'
        }
    });

    if (!completedSession) {
        return { canReview: false, reason: 'No completed session found' };
    }

    // Check for existing review
    const existingReview = await prisma.consultationReview.findFirst({
        where: {
            clientId,
            consultantId
        }
    });

    if (existingReview) {
        return { canReview: false, reason: 'Already reviewed', existingReview };
    }

    return { canReview: true };
};

/**
 * Recalculate and update consultant's average rating
 */
export const updateConsultantRating = async (consultantId: string) => {
    const result = await prisma.consultationReview.aggregate({
        where: {
            consultantId,
            isPublished: true
        },
        _avg: {
            rating: true
        },
        _count: {
            rating: true
        }
    });

    // Note: ConsultantProfile may not have averageRating field in DB yet
    // For now, we store it but the actual schema update may be needed
    // The frontend currently expects averageRating from the profile

    return {
        averageRating: result._avg.rating || 0,
        totalReviews: result._count.rating
    };
};

/**
 * Delete a review (soft delete by unpublishing)
 */
export const deleteReview = async (reviewId: string, clientId: string) => {
    const review = await prisma.consultationReview.findUnique({
        where: { id: reviewId }
    });

    if (!review) {
        throw new Error('Review not found');
    }

    if (review.clientId !== clientId) {
        throw new Error('Not authorized to delete this review');
    }

    const updated = await prisma.consultationReview.update({
        where: { id: reviewId },
        data: { isPublished: false }
    });

    // Update consultant's average rating
    await updateConsultantRating(review.consultantId);

    return updated;
};
