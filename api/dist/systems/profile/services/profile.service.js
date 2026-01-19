"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileService = void 0;
const db_1 = require("../../utils/db");
class ProfileService {
    async getProfile(userId) {
        const user = await db_1.db.user.findUnique({
            where: { id: userId },
            include: {
                umkmProfile: true,
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
            umkm: user.umkmProfile,
            mentor: user.mentorProfile
        };
    }
    async updateUMKMProfile(userId, data) {
        // Check if user exists
        const user = await db_1.db.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new Error('User not found');
        // Upsert UMKM Profile
        const profile = await db_1.db.uMKMProfile.upsert({
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
