import { Request, Response } from 'express';
import { packageService } from '../services/package.service';
import * as consultantService from '../services/consultant.service';

export const packageController = {
    /**
     * Create a new package
     * POST /api/consultation/packages
     */
    async createPackage(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            // Get consultant profile for this user
            const profile = await consultantService.getProfileByUserId(userId);
            if (!profile) {
                return res.status(404).json({ error: 'Consultant profile not found' });
            }

            const { name, durationMinutes, price, description, isActive } = req.body;

            if (!name || !durationMinutes || !price) {
                return res.status(400).json({ error: 'Name, duration, and price are required' });
            }

            const pkg = await packageService.createPackage({
                consultantId: profile.id,
                name,
                durationMinutes,
                price,
                description,
                isActive
            });

            res.status(201).json(pkg);
        } catch (error) {
            console.error('Error creating package:', error);
            res.status(500).json({ error: 'Failed to create package' });
        }
    },

    /**
     * Get own packages (for consultant management)
     * GET /api/consultation/packages
     */
    async getOwnPackages(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const profile = await consultantService.getProfileByUserId(userId);
            if (!profile) {
                return res.status(404).json({ error: 'Consultant profile not found' });
            }

            const packages = await packageService.getPackagesByConsultant(profile.id);
            res.json(packages);
        } catch (error) {
            console.error('Error getting packages:', error);
            res.status(500).json({ error: 'Failed to get packages' });
        }
    },

    /**
     * Get public packages for a consultant
     * GET /api/consultation/consultants/:consultantId/packages
     */
    async getConsultantPackages(req: Request, res: Response) {
        try {
            const { consultantId } = req.params;
            const packages = await packageService.getActivePackages(consultantId);
            res.json(packages);
        } catch (error) {
            console.error('Error getting consultant packages:', error);
            res.status(500).json({ error: 'Failed to get packages' });
        }
    },

    /**
     * Update a package
     * PUT /api/consultation/packages/:id
     */
    async updatePackage(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { id } = req.params;
            const profile = await consultantService.getProfileByUserId(userId);
            if (!profile) {
                return res.status(404).json({ error: 'Consultant profile not found' });
            }

            // Verify ownership
            const isOwner = await packageService.verifyOwnership(id, profile.id);
            if (!isOwner) {
                return res.status(403).json({ error: 'Not authorized to update this package' });
            }

            const { name, durationMinutes, price, description, isActive, sortOrder } = req.body;
            const pkg = await packageService.updatePackage(id, {
                name,
                durationMinutes,
                price,
                description,
                isActive,
                sortOrder
            });

            res.json(pkg);
        } catch (error) {
            console.error('Error updating package:', error);
            res.status(500).json({ error: 'Failed to update package' });
        }
    },

    /**
     * Delete a package
     * DELETE /api/consultation/packages/:id
     */
    async deletePackage(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const { id } = req.params;
            const profile = await consultantService.getProfileByUserId(userId);
            if (!profile) {
                return res.status(404).json({ error: 'Consultant profile not found' });
            }

            // Verify ownership
            const isOwner = await packageService.verifyOwnership(id, profile.id);
            if (!isOwner) {
                return res.status(403).json({ error: 'Not authorized to delete this package' });
            }

            await packageService.deletePackage(id);
            res.json({ success: true });
        } catch (error) {
            console.error('Error deleting package:', error);
            res.status(500).json({ error: 'Failed to delete package' });
        }
    },

    /**
     * Reorder packages
     * PUT /api/consultation/packages/reorder
     */
    async reorderPackages(req: Request, res: Response) {
        try {
            const userId = (req as any).user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            const profile = await consultantService.getProfileByUserId(userId);
            if (!profile) {
                return res.status(404).json({ error: 'Consultant profile not found' });
            }

            const { packageIds } = req.body;
            if (!Array.isArray(packageIds)) {
                return res.status(400).json({ error: 'packageIds must be an array' });
            }

            await packageService.reorderPackages(profile.id, packageIds);
            res.json({ success: true });
        } catch (error) {
            console.error('Error reordering packages:', error);
            res.status(500).json({ error: 'Failed to reorder packages' });
        }
    }
};
