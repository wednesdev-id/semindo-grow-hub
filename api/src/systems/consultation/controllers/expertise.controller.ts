import { Request, Response, NextFunction } from 'express';
import * as expertiseService from '../services/expertise.service';

/**
 * List all expertise categories
 * GET /admin/expertise
 */
export const listExpertise = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const {
            search,
            isActive,
            isDeleted,
            limit,
            offset
        } = req.query;

        const result = await expertiseService.listExpertise({
            search: search as string,
            isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
            isDeleted: isDeleted === 'true' ? true : false,
            limit: limit ? parseInt(limit as string) : undefined,
            offset: offset ? parseInt(offset as string) : undefined
        });

        res.json({
            success: true,
            data: result.items,
            meta: {
                total: result.total,
                limit: result.limit,
                offset: result.offset
            }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get single expertise by ID
 * GET /admin/expertise/:id
 */
export const getExpertise = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const expertise = await expertiseService.getExpertiseById(id);

        res.json({
            success: true,
            data: expertise
        });
    } catch (error: any) {
        if (error.message.includes('not found')) {
            return res.status(404).json({ success: false, error: error.message });
        }
        next(error);
    }
};

/**
 * Create new expertise
 * POST /admin/expertise
 */
export const createExpertise = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const { name, description, icon, categoryGroup } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                error: 'Name is required'
            });
        }

        const expertise = await expertiseService.createExpertise({
            name,
            description,
            icon,
            categoryGroup
        }, userId);

        res.status(201).json({
            success: true,
            data: expertise
        });
    } catch (error: any) {
        if (error.message.includes('already exists')) {
            return res.status(409).json({ success: false, error: error.message });
        }
        next(error);
    }
};

/**
 * Update expertise
 * PATCH /admin/expertise/:id
 */
export const updateExpertise = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const { id } = req.params;
        const { name, description, icon, categoryGroup, isActive } = req.body;

        const expertise = await expertiseService.updateExpertise(id, {
            name,
            description,
            icon,
            categoryGroup,
            isActive
        }, userId);

        res.json({
            success: true,
            data: expertise
        });
    } catch (error: any) {
        if (error.message.includes('not found')) {
            return res.status(404).json({ success: false, error: error.message });
        }
        if (error.message.includes('already exists')) {
            return res.status(409).json({ success: false, error: error.message });
        }
        next(error);
    }
};

/**
 * Soft delete expertise
 * DELETE /admin/expertise/:id
 */
export const deleteExpertise = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const { id } = req.params;
        const result = await expertiseService.softDeleteExpertise(id, userId);

        res.json({
            success: true,
            data: result,
            message: 'Expertise category deleted successfully'
        });
    } catch (error: any) {
        if (error.message.includes('not found')) {
            return res.status(404).json({ success: false, error: error.message });
        }
        next(error);
    }
};

/**
 * Restore deleted expertise
 * POST /admin/expertise/:id/restore
 */
export const restoreExpertise = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const { id } = req.params;
        const expertise = await expertiseService.restoreExpertise(id, userId);

        res.json({
            success: true,
            data: expertise,
            message: 'Expertise category restored successfully'
        });
    } catch (error: any) {
        if (error.message.includes('not found') || error.message.includes('not deleted')) {
            return res.status(400).json({ success: false, error: error.message });
        }
        next(error);
    }
};

/**
 * Get expertise usage stats
 * GET /admin/expertise/:id/consultants
 */
export const getExpertiseConsultants = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const stats = await expertiseService.getExpertiseUsageStats(id);

        res.json({
            success: true,
            data: stats
        });
    } catch (error: any) {
        if (error.message.includes('not found')) {
            return res.status(404).json({ success: false, error: error.message });
        }
        next(error);
    }
};

/**
 * Migrate consultants to another expertise
 * POST /admin/expertise/:id/migrate/:targetId
 */
export const migrateConsultants = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user?.userId;
        if (!userId) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }

        const { id, targetId } = req.params;
        const result = await expertiseService.migrateConsultants(id, targetId, userId);

        res.json({
            success: true,
            data: result,
            message: `Migrated ${result.migratedCount} consultants from ${result.from} to ${result.to}`
        });
    } catch (error: any) {
        if (error.message.includes('not found')) {
            return res.status(404).json({ success: false, error: error.message });
        }
        next(error);
    }
};

/**
 * Get active expertise (public endpoint)
 * GET /consultation/expertise/active
 */
export const getActiveExpertise = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await expertiseService.listExpertise({
            isActive: true,
            isDeleted: false,
            limit: 100
        });

        res.json({
            success: true,
            data: result.items.map(item => ({
                id: item.id,
                name: item.name,
                slug: item.slug,
                description: item.description,
                icon: item.icon,
                categoryGroup: item.categoryGroup
            }))
        });
    } catch (error) {
        next(error);
    }
};
