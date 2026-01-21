"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileService = void 0;
const db_1 = require("../../utils/db");
class ProfileService {
    async getProfile(userId) {
        const user = await db_1.db.user.findUnique({
            where: { id: userId },
            include: {
                umkmProfiles: true, // Changed to plural for 1:N relation
                mentorProfile: true,
                userRoles: {
                    include: { role: true }
                }
            }
        });
        if (!user)
            throw new Error('User not found');
        return {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                roles: user.userRoles.map(ur => ur.role.name)
            },
            umkmProfiles: user.umkmProfiles, // Return array of profiles
            umkm: user.umkmProfiles[0] || null, // Keep backward compatibility - return first profile
            mentor: user.mentorProfile
        };
    }
    // Get all UMKM profiles for a user
    async getUserUMKMProfiles(userId) {
        const profiles = await db_1.db.uMKMProfile.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        return profiles;
    }
    // Get specific UMKM profile by ID
    async getUMKMProfileById(profileId) {
        const profile = await db_1.db.uMKMProfile.findUnique({
            where: { id: profileId },
            include: {
                user: {
                    select: { id: true, email: true, fullName: true }
                }
            }
        });
        if (!profile)
            throw new Error('UMKM Profile not found');
        return profile;
    }
    // Create new UMKM profile for user (status: pending for approval)
    async createUMKMProfile(userId, data) {
        const user = await db_1.db.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new Error('User not found');
        const profile = await db_1.db.uMKMProfile.create({
            data: {
                userId,
                ...data,
                status: 'pending' // Requires admin approval
            }
        });
        return profile;
    }
    // Approve UMKM profile and assign 'umkm' role to user
    async approveUMKMProfile(profileId, approvedBy) {
        const profile = await db_1.db.uMKMProfile.findUnique({
            where: { id: profileId },
            include: { user: { include: { userRoles: { include: { role: true } } } } }
        });
        if (!profile)
            throw new Error('UMKM Profile not found');
        // Update status to approved
        const updated = await db_1.db.uMKMProfile.update({
            where: { id: profileId },
            data: {
                status: 'approved'
            }
        });
        // Check if user already has 'umkm' role
        const hasUmkmRole = profile.user.userRoles.some(ur => ur.role.name === 'umkm');
        if (!hasUmkmRole) {
            // Find or create 'umkm' role
            let umkmRole = await db_1.db.role.findUnique({ where: { name: 'umkm' } });
            if (!umkmRole) {
                umkmRole = await db_1.db.role.create({
                    data: { name: 'umkm', displayName: 'UMKM Owner' }
                });
            }
            // Assign role to user
            await db_1.db.userRole.create({
                data: {
                    userId: profile.userId,
                    roleId: umkmRole.id
                }
            });
        }
        return updated;
    }
    // Reject UMKM profile with reason
    async rejectUMKMProfile(profileId, reason, rejectedBy) {
        const profile = await db_1.db.uMKMProfile.findUnique({ where: { id: profileId } });
        if (!profile)
            throw new Error('UMKM Profile not found');
        const updated = await db_1.db.uMKMProfile.update({
            where: { id: profileId },
            data: {
                status: 'rejected',
                segmentationReason: reason // Using this field for rejection reason
            }
        });
        return updated;
    }
    // Get all pending UMKM profiles (for admin approval page)
    async getPendingUMKMProfiles() {
        return db_1.db.uMKMProfile.findMany({
            where: { status: 'pending' },
            include: {
                user: {
                    select: { id: true, email: true, fullName: true }
                }
            },
            orderBy: { createdAt: 'asc' }
        });
    }
    // Update specific UMKM profile by ID
    async updateUMKMProfile(profileId, data) {
        const profile = await db_1.db.uMKMProfile.findUnique({ where: { id: profileId } });
        if (!profile)
            throw new Error('UMKM Profile not found');
        const updated = await db_1.db.uMKMProfile.update({
            where: { id: profileId },
            data
        });
        return updated;
    }
    // Upsert UMKM Profile (for backward compatibility - updates first or creates new)
    async upsertUMKMProfile(userId, data, profileId) {
        const user = await db_1.db.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new Error('User not found');
        // If profileId provided, update that specific profile
        if (profileId) {
            return this.updateUMKMProfile(profileId, data);
        }
        // Check if user has any UMKM profile
        const existingProfiles = await db_1.db.uMKMProfile.findMany({
            where: { userId },
            take: 1
        });
        if (existingProfiles.length > 0) {
            // Update first profile (backward compatibility)
            return db_1.db.uMKMProfile.update({
                where: { id: existingProfiles[0].id },
                data
            });
        }
        else {
            // Create new profile
            return db_1.db.uMKMProfile.create({
                data: {
                    userId,
                    ...data
                }
            });
        }
    }
    // Delete UMKM profile by ID
    async deleteUMKMProfile(profileId) {
        const profile = await db_1.db.uMKMProfile.findUnique({ where: { id: profileId } });
        if (!profile)
            throw new Error('UMKM Profile not found');
        await db_1.db.uMKMProfile.delete({ where: { id: profileId } });
        return { success: true };
    }
    async updateMentorProfile(userId, data) {
        // Check if user exists
        const user = await db_1.db.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new Error('User not found');
        // Upsert Mentor Profile
        const profile = await db_1.db.mentorProfile.upsert({
            where: { userId },
            update: {
                ...data
            },
            create: {
                userId,
                ...data
            }
        });
        return profile;
    }
}
exports.ProfileService = ProfileService;
