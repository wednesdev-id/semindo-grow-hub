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
exports.getActiveExpertise = exports.migrateConsultants = exports.getExpertiseConsultants = exports.restoreExpertise = exports.deleteExpertise = exports.updateExpertise = exports.createExpertise = exports.getExpertise = exports.listExpertise = void 0;
const expertiseService = __importStar(require("../services/expertise.service"));
/**
 * List all expertise categories
 * GET /admin/expertise
 */
const listExpertise = async (req, res, next) => {
    try {
        const { search, isActive, isDeleted, limit, offset } = req.query;
        const result = await expertiseService.listExpertise({
            search: search,
            isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
            isDeleted: isDeleted === 'true' ? true : false,
            limit: limit ? parseInt(limit) : undefined,
            offset: offset ? parseInt(offset) : undefined
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
    }
    catch (error) {
        next(error);
    }
};
exports.listExpertise = listExpertise;
/**
 * Get single expertise by ID
 * GET /admin/expertise/:id
 */
const getExpertise = async (req, res, next) => {
    try {
        const { id } = req.params;
        const expertise = await expertiseService.getExpertiseById(id);
        res.json({
            success: true,
            data: expertise
        });
    }
    catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({ success: false, error: error.message });
        }
        next(error);
    }
};
exports.getExpertise = getExpertise;
/**
 * Create new expertise
 * POST /admin/expertise
 */
const createExpertise = async (req, res, next) => {
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
    }
    catch (error) {
        if (error.message.includes('already exists')) {
            return res.status(409).json({ success: false, error: error.message });
        }
        next(error);
    }
};
exports.createExpertise = createExpertise;
/**
 * Update expertise
 * PATCH /admin/expertise/:id
 */
const updateExpertise = async (req, res, next) => {
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
    }
    catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({ success: false, error: error.message });
        }
        if (error.message.includes('already exists')) {
            return res.status(409).json({ success: false, error: error.message });
        }
        next(error);
    }
};
exports.updateExpertise = updateExpertise;
/**
 * Soft delete expertise
 * DELETE /admin/expertise/:id
 */
const deleteExpertise = async (req, res, next) => {
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
    }
    catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({ success: false, error: error.message });
        }
        next(error);
    }
};
exports.deleteExpertise = deleteExpertise;
/**
 * Restore deleted expertise
 * POST /admin/expertise/:id/restore
 */
const restoreExpertise = async (req, res, next) => {
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
    }
    catch (error) {
        if (error.message.includes('not found') || error.message.includes('not deleted')) {
            return res.status(400).json({ success: false, error: error.message });
        }
        next(error);
    }
};
exports.restoreExpertise = restoreExpertise;
/**
 * Get expertise usage stats
 * GET /admin/expertise/:id/consultants
 */
const getExpertiseConsultants = async (req, res, next) => {
    try {
        const { id } = req.params;
        const stats = await expertiseService.getExpertiseUsageStats(id);
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({ success: false, error: error.message });
        }
        next(error);
    }
};
exports.getExpertiseConsultants = getExpertiseConsultants;
/**
 * Migrate consultants to another expertise
 * POST /admin/expertise/:id/migrate/:targetId
 */
const migrateConsultants = async (req, res, next) => {
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
    }
    catch (error) {
        if (error.message.includes('not found')) {
            return res.status(404).json({ success: false, error: error.message });
        }
        next(error);
    }
};
exports.migrateConsultants = migrateConsultants;
/**
 * Get active expertise (public endpoint)
 * GET /consultation/expertise/active
 */
const getActiveExpertise = async (req, res, next) => {
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
    }
    catch (error) {
        next(error);
    }
};
exports.getActiveExpertise = getActiveExpertise;
