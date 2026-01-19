import { PrismaClient, User } from '../../../../prisma/generated/client';
import { UMKMProfileDto, MentorProfileDto } from '../types/profile.types';
import { db } from '../../utils/db';

export class ProfileService {
    async getProfile(userId: string) {
        const user = await db.user.findUnique({
            where: { id: userId },
            include: {
                umkmProfiles: true, // Changed to plural for 1:N relation
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
            umkmProfiles: user.umkmProfiles, // Return array of profiles
            umkm: user.umkmProfiles[0] || null, // Keep backward compatibility - return first profile
            mentor: user.mentorProfile
        }
    }

    // Get all UMKM profiles for a user
    async getUserUMKMProfiles(userId: string) {
        const profiles = await db.uMKMProfile.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        })
        return profiles
    }

    // Get specific UMKM profile by ID
    async getUMKMProfileById(profileId: string) {
        const profile = await db.uMKMProfile.findUnique({
            where: { id: profileId },
            include: {
                user: {
                    select: { id: true, email: true, fullName: true }
                }
            }
        })
        if (!profile) throw new Error('UMKM Profile not found')
        return profile
    }

    // Create new UMKM profile for user (status: pending for approval)
    async createUMKMProfile(userId: string, data: UMKMProfileDto) {
        const user = await db.user.findUnique({ where: { id: userId } })
        if (!user) throw new Error('User not found')

        const profile = await db.uMKMProfile.create({
            data: {
                userId,
                ...data,
                status: 'pending' // Requires admin approval
            }
        })

        return profile
    }

    // Approve UMKM profile and assign 'umkm' role to user
    async approveUMKMProfile(profileId: string, approvedBy: string) {
        const profile = await db.uMKMProfile.findUnique({
            where: { id: profileId },
            include: { user: { include: { userRoles: { include: { role: true } } } } }
        })
        if (!profile) throw new Error('UMKM Profile not found')

        // Update status to approved
        const updated = await db.uMKMProfile.update({
            where: { id: profileId },
            data: {
                status: 'approved'
            }
        })

        // Check if user already has 'umkm' role
        const hasUmkmRole = profile.user.userRoles.some(ur => ur.role.name === 'umkm')

        if (!hasUmkmRole) {
            // Find or create 'umkm' role
            let umkmRole = await db.role.findUnique({ where: { name: 'umkm' } })
            if (!umkmRole) {
                umkmRole = await db.role.create({
                    data: { name: 'umkm', displayName: 'UMKM Owner' }
                })
            }

            // Assign role to user
            await db.userRole.create({
                data: {
                    userId: profile.userId,
                    roleId: umkmRole.id
                }
            })
        }

        return updated
    }

    // Reject UMKM profile with reason
    async rejectUMKMProfile(profileId: string, reason: string, rejectedBy: string) {
        const profile = await db.uMKMProfile.findUnique({ where: { id: profileId } })
        if (!profile) throw new Error('UMKM Profile not found')

        const updated = await db.uMKMProfile.update({
            where: { id: profileId },
            data: {
                status: 'rejected',
                segmentationReason: reason // Using this field for rejection reason
            }
        })

        return updated
    }

    // Get all pending UMKM profiles (for admin approval page)
    async getPendingUMKMProfiles() {
        return db.uMKMProfile.findMany({
            where: { status: 'pending' },
            include: {
                user: {
                    select: { id: true, email: true, fullName: true }
                }
            },
            orderBy: { createdAt: 'asc' }
        })
    }

    // Update specific UMKM profile by ID
    async updateUMKMProfile(profileId: string, data: UMKMProfileDto) {
        const profile = await db.uMKMProfile.findUnique({ where: { id: profileId } })
        if (!profile) throw new Error('UMKM Profile not found')

        const updated = await db.uMKMProfile.update({
            where: { id: profileId },
            data
        })

        return updated
    }

    // Upsert UMKM Profile (for backward compatibility - updates first or creates new)
    async upsertUMKMProfile(userId: string, data: UMKMProfileDto, profileId?: string) {
        const user = await db.user.findUnique({ where: { id: userId } })
        if (!user) throw new Error('User not found')

        // If profileId provided, update that specific profile
        if (profileId) {
            return this.updateUMKMProfile(profileId, data)
        }

        // Check if user has any UMKM profile
        const existingProfiles = await db.uMKMProfile.findMany({
            where: { userId },
            take: 1
        })

        if (existingProfiles.length > 0) {
            // Update first profile (backward compatibility)
            return db.uMKMProfile.update({
                where: { id: existingProfiles[0].id },
                data
            })
        } else {
            // Create new profile
            return db.uMKMProfile.create({
                data: {
                    userId,
                    ...data
                }
            })
        }
    }

    // Delete UMKM profile by ID
    async deleteUMKMProfile(profileId: string) {
        const profile = await db.uMKMProfile.findUnique({ where: { id: profileId } })
        if (!profile) throw new Error('UMKM Profile not found')

        await db.uMKMProfile.delete({ where: { id: profileId } })
        return { success: true }
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
