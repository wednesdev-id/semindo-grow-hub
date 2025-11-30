import { PrismaClient, User } from '@prisma/client';
import { UMKMProfileDto, MentorProfileDto } from '../types/profile.types';
import { db } from '../../utils/db';

export class ProfileService {
    async getProfile(userId: string) {
        const user = await db.user.findUnique({
            where: { id: userId },
            include: {
                umkmProfile: true,
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
            umkm: user.umkmProfile,
            mentor: user.mentorProfile
        }
    }

    async updateUMKMProfile(userId: string, data: UMKMProfileDto) {
        // Check if user exists
        const user = await db.user.findUnique({ where: { id: userId } })
        if (!user) throw new Error('User not found')

        // Upsert UMKM Profile
        const profile = await db.uMKMProfile.upsert({
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
