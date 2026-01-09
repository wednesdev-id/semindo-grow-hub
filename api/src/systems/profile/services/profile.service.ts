import { PrismaClient, User } from '@prisma/client';
import { UMKMProfileDto, MentorProfileDto } from '../types/profile.types';
import { db } from '../../utils/db';

export class ProfileService {
    async getProfile(userId: string) {
        const user = await db.user.findUnique({
            where: { id: userId },
            include: {
                umkmProfiles: true,
                mentorProfile: true,
                userRoles: {
                    include: { role: true }
                }
            }
        })

        if (!user) throw new Error('User not found')

        return {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                roles: user.userRoles.map(ur => ur.role.name)
            },
            umkm: user.umkmProfiles,
            mentor: user.mentorProfile
        }
    }

    async updateUMKMProfile(userId: string, data: UMKMProfileDto) {
        // Check if user exists
        const user = await db.user.findUnique({ where: { id: userId } })
        if (!user) throw new Error('User not found')

        // Find existing profile (1:N - get first one for this user)
        const existingProfile = await db.uMKMProfile.findFirst({
            where: { userId }
        })

        if (existingProfile) {
            // Update existing profile
            return db.uMKMProfile.update({
                where: { id: existingProfile.id },
                data: { ...data }
            })
        } else {
            // Create new profile
            return db.uMKMProfile.create({
                data: { userId, ...data }
            })
        }
    }

    async updateMentorProfile(userId: string, data: MentorProfileDto) {
        // Check if user exists
        const user = await db.user.findUnique({ where: { id: userId } })
        if (!user) throw new Error('User not found')

        // Upsert Mentor Profile
        const profile = await db.mentorProfile.upsert({
            where: { userId },
            update: {
                ...data
            },
            create: {
                userId,
                ...data
            }
        })

        return profile
    }
}
