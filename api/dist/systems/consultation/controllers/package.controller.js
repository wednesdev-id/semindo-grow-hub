"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.packageController = void 0;
const package_service_1 = require("../services/package.service");
const consultantService = __importStar(require("../services/consultant.service"));
exports.packageController = {
    /**
     * Create a new package
     * POST /api/consultation/packages
     */
    async createPackage(req, res) {
        try {
            const userId = req.user?.id;
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
            const pkg = await package_service_1.packageService.createPackage({
                consultantId: profile.id,
                name,
                durationMinutes,
                price,
                description,
                isActive
            });
            res.status(201).json(pkg);
        }
        catch (error) {
            console.error('Error creating package:', error);
            res.status(500).json({ error: 'Failed to create package' });
        }
    },
    /**
     * Get own packages (for consultant management)
     * GET /api/consultation/packages
     */
    async getOwnPackages(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const profile = await consultantService.getProfileByUserId(userId);
            if (!profile) {
                return res.status(404).json({ error: 'Consultant profile not found' });
            }
            const packages = await package_service_1.packageService.getPackagesByConsultant(profile.id);
            res.json(packages);
        }
        catch (error) {
            console.error('Error getting packages:', error);
            res.status(500).json({ error: 'Failed to get packages' });
        }
    },
    /**
     * Get public packages for a consultant
     * GET /api/consultation/consultants/:consultantId/packages
     */
    async getConsultantPackages(req, res) {
        try {
            const { consultantId } = req.params;
            const packages = await package_service_1.packageService.getActivePackages(consultantId);
            res.json(packages);
        }
        catch (error) {
            console.error('Error getting consultant packages:', error);
            res.status(500).json({ error: 'Failed to get packages' });
        }
    },
    /**
     * Update a package
     * PUT /api/consultation/packages/:id
     */
    async updatePackage(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { id } = req.params;
            const profile = await consultantService.getProfileByUserId(userId);
            if (!profile) {
                return res.status(404).json({ error: 'Consultant profile not found' });
            }
            // Verify ownership
            const isOwner = await package_service_1.packageService.verifyOwnership(id, profile.id);
            if (!isOwner) {
                return res.status(403).json({ error: 'Not authorized to update this package' });
            }
            const { name, durationMinutes, price, description, isActive, sortOrder } = req.body;
            const pkg = await package_service_1.packageService.updatePackage(id, {
                name,
                durationMinutes,
                price,
                description,
                isActive,
                sortOrder
            });
            res.json(pkg);
        }
        catch (error) {
            console.error('Error updating package:', error);
            res.status(500).json({ error: 'Failed to update package' });
        }
    },
    /**
     * Delete a package
     * DELETE /api/consultation/packages/:id
     */
    async deletePackage(req, res) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
            }
            const { id } = req.params;
            const profile = await consultantService.getProfileByUserId(userId);
            if (!profile) {
                return res.status(404).json({ error: 'Consultant profile not found' });
            }
            // Verify ownership
            const isOwner = await package_service_1.packageService.verifyOwnership(id, profile.id);
            if (!isOwner) {
                return res.status(403).json({ error: 'Not authorized to delete this package' });
            }
            await package_service_1.packageService.deletePackage(id);
            res.json({ success: true });
        }
        catch (error) {
            console.error('Error deleting package:', error);
            res.status(500).json({ error: 'Failed to delete package' });
        }
    },
    /**
     * Reorder packages
     * PUT /api/consultation/packages/reorder
     */
    async reorderPackages(req, res) {
        try {
            const userId = req.user?.id;
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
            await package_service_1.packageService.reorderPackages(profile.id, packageIds);
            res.json({ success: true });
        }
        catch (error) {
            console.error('Error reordering packages:', error);
            res.status(500).json({ error: 'Failed to reorder packages' });
        }
    }
};
