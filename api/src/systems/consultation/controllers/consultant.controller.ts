import { Request, Response, NextFunction } from 'express';
import * as consultantService from '../services/consultant.service';

/**
 * Public: List all approved consultants with filtering
 */
export const listConsultants = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { expertise, minRating, maxPrice, featured, status } = req.query;

        const consultants = await consultantService.listConsultants({
            expertise: expertise as string,
            minRating: minRating ? Number(minRating) : undefined,
            maxPrice: maxPrice ? Number(maxPrice) : undefined,
            featured: featured === 'true',
            status: status as string
        });

        res.json({
            success: true,
            data: consultants
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Public: Get consultant full profile
 */
export const getConsultant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const consultant = await consultantService.getConsultantProfile(id);

        if (!consultant) {
            return res.status(404).json({
                success: false,
                error: 'Consultant not found'
            });
        }

        res.json({
            success: true,
            data: consultant
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Protected: Create consultant profile (user becomes consultant)
 */
export const createProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const profileData = req.body;

        const profile = await consultantService.createConsultantProfile(userId, profileData);

        res.status(201).json({
            success: true,
            data: profile,
            message: 'Consultant profile created. Pending admin approval.'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Protected: Update own consultant profile
 */
export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const updates = req.body;

        const profile = await consultantService.updateConsultantProfile(userId, updates);

        res.json({
            success: true,
            data: profile
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Protected: Get own consultant profile with stats
 */
export const getOwnProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const profile = await consultantService.getProfileByUserId(userId);

        if (!profile) {
            return res.status(404).json({
                success: false,
                error: 'Consultant profile not found. Please complete onboarding.'
            });
        }

        res.json({
            success: true,
            data: profile
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Protected: Get own availability slots
 */
export const getOwnAvailability = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user?.userId || (req as any).user?.id;
        console.log(`[Controller] getOwnAvailability for user: ${userId}`);

        if (!userId) {
            return res.status(401).json({ error: 'User ID missing in request' });
        }

        const availability = await consultantService.getConsultantAvailability(userId);

        res.json({
            success: true,
            data: availability
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Protected: Add availability slot
 */
export const addAvailability = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user?.userId || (req as any).user?.id;
        console.log(`[Controller] addAvailability for user: ${userId}`);

        if (!userId) {
            return res.status(401).json({ error: 'User ID missing in request' });
        }

        const slotData = req.body;

        const slot = await consultantService.addAvailabilitySlot(userId, slotData);

        res.status(201).json({
            success: true,
            data: slot
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Protected: Remove availability slot
 */
export const removeAvailability = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const { id } = req.params;

        await consultantService.removeAvailabilitySlot(userId, id);

        res.json({
            success: true,
            message: 'Availability slot removed'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Admin: Approve consultant profile
 */
export const approveConsultant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const adminId = (req as any).user.id;

        const profile = await consultantService.approveConsultant(id, adminId);

        res.json({
            success: true,
            data: profile,
            message: 'Consultant approved'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Admin: Reject consultant profile
 */
export const rejectConsultant = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;

        const profile = await consultantService.rejectConsultant(id, reason);

        res.json({
            success: true,
            data: profile,
            message: 'Consultant rejected'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Public: Get instructors (consultants who teach courses)
 */
export const getInstructors = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const instructors = await consultantService.getInstructors();

        res.json({
            success: true,
            data: instructors
        });
    } catch (error) {
        next(error);
    }
};

