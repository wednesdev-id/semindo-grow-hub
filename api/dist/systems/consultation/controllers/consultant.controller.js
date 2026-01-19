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
exports.getInstructors = exports.rejectConsultant = exports.approveConsultant = exports.removeAvailability = exports.addAvailability = exports.getOwnAvailability = exports.getOwnProfile = exports.updateProfile = exports.createProfile = exports.getConsultant = exports.listConsultants = void 0;
const consultantService = __importStar(require("../services/consultant.service"));
/**
 * Public: List all approved consultants with filtering
 */
const listConsultants = async (req, res, next) => {
    try {
        const { expertise, minRating, maxPrice, featured, status } = req.query;
        const consultants = await consultantService.listConsultants({
            expertise: expertise,
            minRating: minRating ? Number(minRating) : undefined,
            maxPrice: maxPrice ? Number(maxPrice) : undefined,
            featured: featured === 'true',
            status: status
        });
        res.json({
            success: true,
            data: consultants
        });
    }
    catch (error) {
        next(error);
    }
};
exports.listConsultants = listConsultants;
/**
 * Public: Get consultant full profile
 */
const getConsultant = async (req, res, next) => {
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
    }
    catch (error) {
        next(error);
    }
};
exports.getConsultant = getConsultant;
/**
 * Protected: Create consultant profile (user becomes consultant)
 */
const createProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const profileData = req.body;
        const profile = await consultantService.createConsultantProfile(userId, profileData);
        res.status(201).json({
            success: true,
            data: profile,
            message: 'Consultant profile created. Pending admin approval.'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createProfile = createProfile;
/**
 * Protected: Update own consultant profile
 */
const updateProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const updates = req.body;
        const profile = await consultantService.updateConsultantProfile(userId, updates);
        res.json({
            success: true,
            data: profile
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProfile = updateProfile;
/**
 * Protected: Get own consultant profile with stats
 */
const getOwnProfile = async (req, res, next) => {
    try {
        const userId = req.user.id;
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
    }
    catch (error) {
        next(error);
    }
};
exports.getOwnProfile = getOwnProfile;
/**
 * Protected: Get own availability slots
 */
const getOwnAvailability = async (req, res, next) => {
    try {
        const userId = req.user?.userId || req.user?.id;
        console.log(`[Controller] getOwnAvailability for user: ${userId}`);
        if (!userId) {
            return res.status(401).json({ error: 'User ID missing in request' });
        }
        const availability = await consultantService.getConsultantAvailability(userId);
        res.json({
            success: true,
            data: availability
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getOwnAvailability = getOwnAvailability;
/**
 * Protected: Add availability slot
 */
const addAvailability = async (req, res, next) => {
    try {
        const userId = req.user?.userId || req.user?.id;
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
    }
    catch (error) {
        next(error);
    }
};
exports.addAvailability = addAvailability;
/**
 * Protected: Remove availability slot
 */
const removeAvailability = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { id } = req.params;
        await consultantService.removeAvailabilitySlot(userId, id);
        res.json({
            success: true,
            message: 'Availability slot removed'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.removeAvailability = removeAvailability;
/**
 * Admin: Approve consultant profile
 */
const approveConsultant = async (req, res, next) => {
    try {
        const { id } = req.params;
        const adminId = req.user.id;
        const profile = await consultantService.approveConsultant(id, adminId);
        res.json({
            success: true,
            data: profile,
            message: 'Consultant approved'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.approveConsultant = approveConsultant;
/**
 * Admin: Reject consultant profile
 */
const rejectConsultant = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        const profile = await consultantService.rejectConsultant(id, reason);
        res.json({
            success: true,
            data: profile,
            message: 'Consultant rejected'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.rejectConsultant = rejectConsultant;
/**
 * Public: Get instructors (consultants who teach courses)
 */
const getInstructors = async (req, res, next) => {
    try {
        const instructors = await consultantService.getInstructors();
        res.json({
            success: true,
            data: instructors
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getInstructors = getInstructors;
