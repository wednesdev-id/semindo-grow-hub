import { Request, Response, NextFunction } from 'express';
import * as reviewService from '../services/review.service';

/**
 * Create a new review
 * POST /reviews
 */
export const createReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const clientId = req.user?.userId;
        if (!clientId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const { consultantId, rating, comment } = req.body;

        if (!consultantId || !rating) {
            return res.status(400).json({
                success: false,
                error: 'consultantId and rating are required'
            });
        }

        const review = await reviewService.createReview(clientId, consultantId, rating, comment);

        res.status(201).json({
            success: true,
            data: review
        });
    } catch (error: any) {
        if (error.message.includes('already reviewed') ||
            error.message.includes('only review') ||
            error.message.includes('Rating must be')) {
            return res.status(400).json({ success: false, error: error.message });
        }
        next(error);
    }
};

/**
 * Get reviews for a consultant
 * GET /reviews/:consultantId
 */
export const getReviews = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { consultantId } = req.params;
        const limit = parseInt(req.query.limit as string) || 20;
        const offset = parseInt(req.query.offset as string) || 0;

        const result = await reviewService.getReviewsByConsultant(consultantId, limit, offset);

        res.json({
            success: true,
            data: result.reviews,
            meta: {
                total: result.total,
                limit,
                offset
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Check if current user can review a consultant
 * GET /reviews/:consultantId/can-review
 */
export const canReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const clientId = req.user?.userId;
        if (!clientId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const { consultantId } = req.params;
        const result = await reviewService.canClientReview(clientId, consultantId);

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Delete (unpublish) a review
 * DELETE /reviews/:reviewId
 */
export const deleteReview = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const clientId = req.user?.userId;
        if (!clientId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const { reviewId } = req.params;
        await reviewService.deleteReview(reviewId, clientId);

        res.json({
            success: true,
            message: 'Review deleted successfully'
        });
    } catch (error: any) {
        if (error.message.includes('not found') || error.message.includes('Not authorized')) {
            return res.status(403).json({ success: false, error: error.message });
        }
        next(error);
    }
};
