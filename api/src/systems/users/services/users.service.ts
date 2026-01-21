import { db } from '../../utils/db';
import { hashPassword } from '../../utils/password';
import { PrismaClient, User, Prisma } from '../../../../prisma/generated/client';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from '../types/users.types';
import { AuditService } from '../../audit/services/audit.service';

export class UsersService {
    private auditService = new AuditService();

    async findAll(query: UserQueryDto) {
        const page = Number(query.page) || 1
        const limit = Number(query.limit) || 10
        const skip = (page - 1) * limit
        const search = query.search || ''
        const roleFilter = query.role
        const isActiveFilter = query.isActive

        const where: any = {
            OR: [
                { email: { contains: search, mode: 'insensitive' } },
                { fullName: { contains: search, mode: 'insensitive' } },
                { businessName: { contains: search, mode: 'insensitive' } },
            ],
        }

        if (roleFilter && roleFilter !== 'all') {
            where.userRoles = {
                some: {
                    role: {
                        name: roleFilter
                    }
                }
            }
        }

        if (isActiveFilter && isActiveFilter !== 'all') {
            where.isActive = isActiveFilter === 'true'
        }

        const [users, total] = await Promise.all([
            db.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    userRoles: {
                        include: {
                            role: true
                        }
                    }
                }
            }),
            db.user.count({ where })
        ])

        return {
            data: users.map(user => ({
                ...user,
                roles: user.userRoles.map(ur => ur.role.name),
                passwordHash: undefined // Exclude password
            })),
            meta: {
                page,
                limit,
                total,
                lastPage: Math.ceil(total / limit)
            }
        }
    }

    async findById(id: string) {
        const user = await db.user.findUnique({
            where: { id },
            include: {
                userRoles: {
                    include: {
                        role: true
                    }
                },
                umkmProfiles: true,
                mentorProfile: true
            }
        })

        if (!user) throw new Error('User not found')

        return {
            ...user,
            roles: user.userRoles.map(ur => ur.role.name),
            passwordHash: undefined
        }
    }

    async create(data: CreateUserDto) {
        const existingUser = await db.user.findUnique({
            where: { email: data.email }
        })

        if (existingUser) throw new Error('Email already registered')

        const passwordHash = await hashPassword(data.password)

        const user = await db.user.create({
            data: {
                email: data.email,
                passwordHash,
                fullName: data.fullName,
                phone: data.phone,
                businessName: data.businessName,
                userRoles: {
                    create: {
                        role: {
                            connectOrCreate: {
                                where: { name: data.role },
                                create: {
                                    name: data.role,
                                    displayName: data.role.toUpperCase(),
                                    description: `${data.role} Role`
                                }
                            }
                        }
                    }
                },
                // Auto-create ConsultantProfile if role is consultant or konsultan
                ...(data.role.toLowerCase() === 'consultant' || data.role.toLowerCase() === 'konsultan' ? {
                    consultantProfile: {
                        create: {
                            status: 'approved',
                            title: 'Consultant',
                            bio: 'Profile under review',
                            yearsExperience: 0,
                            hourlyRate: 0,
                            expertiseAreas: [],
                            industries: [],
                            languages: ['Indonesian'],
                            isAcceptingNewClients: false,
                            totalSessions: 0,
                            averageRating: 0
                        }
                    }
                } : {})
            },
            include: {
                userRoles: {
                    include: { role: true }
                }
            }
        }) as any

        return {
            ...user,
            roles: user.userRoles.map((ur: any) => ur.role.name),
            passwordHash: undefined
        }
    }

    async update(id: string, data: UpdateUserDto) {
        const updateData: any = {
            fullName: data.fullName,
            phone: data.phone,
            businessName: data.businessName,
            isActive: data.isActive,
            // Personal Location fields
            address: data.address,
            city: data.city,
            province: data.province,
            location: data.location
        }

        if (data.password) {
            updateData.passwordHash = await hashPassword(data.password)
        }

        // Handle Role Update if provided
        if (data.role) {
            const role = await db.role.findUnique({ where: { name: data.role } })

            if (role) {
                // Delete existing roles
                await db.userRole.deleteMany({
                    where: { userId: id }
                })

                // Add new role
                await db.userRole.create({
                    data: {
                        userId: id,
                        roleId: role.id
                    }
                })
            }
        }

        const user = await db.user.update({
            where: { id },
            data: updateData,
            include: {
                userRoles: {
                    include: { role: true }
                }
            }
        })

        return {
            ...user,
            roles: user.userRoles.map(ur => ur.role.name),
            passwordHash: undefined
        }
    }

    async delete(id: string) {
        await db.user.delete({
            where: { id }
        })
        return { message: 'User deleted successfully' }
    }

    // Profile Management Methods
    async getCurrentUser(id: string) {
        const user = await db.user.findUnique({
            where: { id },
            include: {
                userRoles: {
                    include: {
                        role: true
                    }
                },
                umkmProfiles: true,
                mentorProfile: true
            }
        })

        if (!user) throw new Error('User not found')

        return {
            ...user,
            roles: user.userRoles.map(ur => ur.role.name),
            passwordHash: undefined
        }
    }

    async updateOwnProfile(id: string, data: { fullName?: string; phone?: string; businessName?: string }) {
        const user = await db.user.update({
            where: { id },
            data: {
                fullName: data.fullName,
                phone: data.phone,
                businessName: data.businessName
            },
            include: {
                userRoles: {
                    include: {
                        role: true
                    }
                }
            }
        })

        return {
            ...user,
            roles: user.userRoles.map(ur => ur.role.name),
            passwordHash: undefined
        }
    }

    async changePassword(id: string, oldPassword: string, newPassword: string) {
        const user = await db.user.findUnique({
            where: { id }
        })

        if (!user) throw new Error('User not found')

        // Verify old password
        const bcrypt = require('bcryptjs')
        const isValid = await bcrypt.compare(oldPassword, user.passwordHash)

        if (!isValid) throw new Error('Current password is incorrect')

        // Hash new password
        const passwordHash = await hashPassword(newPassword)

        await db.user.update({
            where: { id },
            data: { passwordHash }
        })

        return { message: 'Password changed successfully' }
    }

    async updateProfilePicture(id: string, profilePictureUrl: string) {
        const user = await db.user.update({
            where: { id },
            data: { profilePictureUrl },
            include: {
                userRoles: {
                    include: {
                        role: true
                    }
                }
            }
        })

        return {
            ...user,
            roles: user.userRoles.map(ur => ur.role.name),
            passwordHash: undefined
        }
    }

    // User-Role Management Methods
    async assignRoles(userId: string, roleIds: string[]) {
        // Check if user exists
        const user = await db.user.findUnique({ where: { id: userId } })
        if (!user) throw new Error('User not found')

        // Delete existing roles
        await db.userRole.deleteMany({
            where: { userId }
        })

        // Create new roles
        await db.userRole.createMany({
            data: roleIds.map(roleId => ({
                userId,
                roleId
            }))
        })

        // Return updated user with roles
        const updatedUser = await db.user.findUnique({
            where: { id: userId },
            include: {
                userRoles: {
                    include: {
                        role: true
                    }
                }
            }
        })

        return {
            ...updatedUser,
            roles: updatedUser!.userRoles.map(ur => ur.role.name),
            passwordHash: undefined
        }
    }

    async removeRole(userId: string, roleId: string) {
        const deleted = await db.userRole.deleteMany({
            where: {
                userId,
                roleId
            }
        })

        if (deleted.count === 0) {
            throw new Error('Role not found for this user')
        }

        return { message: 'Role removed from user' }
    }
}
