"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteReview = exports.updateConsultantRating = exports.canClientReview = exports.getReviewsByConsultant = exports.createReview = void 0;
const prisma_1 = require("../../../lib/prisma");
/**
 * Create a new review for a consultant
 */
const createReview = async (clientId, consultantId, rating, comment) => {
    // Verify rating is between 1-5
    if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
    }
    // Check if client has completed session with this consultant
    const completedSession = await prisma_1.prisma.consultationRequest.findFirst({
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
    const existingReview = await prisma_1.prisma.consultationReview.findFirst({
        where: {
            clientId,
            consultantId
        }
    });
    if (existingReview) {
        throw new Error('You have already reviewed this consultant');
    }
    // Create the review
    const review = await prisma_1.prisma.consultationReview.create({
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
    await (0, exports.updateConsultantRating)(consultantId);
    return review;
};
exports.createReview = createReview;
/**
 * Get all published reviews for a consultant
 */
const getReviewsByConsultant = async (consultantId, limit = 20, offset = 0) => {
    const reviews = await prisma_1.prisma.consultationReview.findMany({
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
    const total = await prisma_1.prisma.consultationReview.count({
        where: {
            consultantId,
            isPublished: true
        }
    });
    return { reviews, total };
};
exports.getReviewsByConsultant = getReviewsByConsultant;
/**
 * Check if client can review a consultant (has completed session, hasn't reviewed yet)
 */
const canClientReview = async (clientId, consultantId) => {
    // Check for completed session
    const completedSession = await prisma_1.prisma.consultationRequest.findFirst({
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
    const existingReview = await prisma_1.prisma.consultationReview.findFirst({
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
exports.canClientReview = canClientReview;
/**
 * Recalculate and update consultant's average rating
 */
const updateConsultantRating = async (consultantId) => {
    const result = await prisma_1.prisma.consultationReview.aggregate({
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
    // Update ConsultantProfile with new average rating
    // Note: consultantId is the ConsultantProfile.id (UUID)
    await prisma_1.prisma.consultantProfile.update({
        where: { id: consultantId },
        data: {
            averageRating: result._avg.rating || 0,
            // totalSessions is handled separately by completed sessions count, 
            // but we could add a totalReviews field if schema supported it.
            // For now, we update averageRating which is critical for display.
        }
    });
    return {
        averageRating: result._avg.rating || 0,
        totalReviews: result._count.rating
    };
};
exports.updateConsultantRating = updateConsultantRating;
/**
 * Delete a review (soft delete by unpublishing)
 */
const deleteReview = async (reviewId, clientId) => {
    const review = await prisma_1.prisma.consultationReview.findUnique({
        where: { id: reviewId }
    });
    if (!review) {
        throw new Error('Review not found');
    }
    if (review.clientId !== clientId) {
        throw new Error('Not authorized to delete this review');
    }
    const updated = await prisma_1.prisma.consultationReview.update({
        where: { id: reviewId },
        data: { isPublished: false }
    });
    // Update consultant's average rating
    await (0, exports.updateConsultantRating)(review.consultantId);
    return updated;
};
exports.deleteReview = deleteReview;
