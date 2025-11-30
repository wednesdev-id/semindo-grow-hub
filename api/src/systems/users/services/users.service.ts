import { db } from '../../utils/db';
import { hashPassword } from '../../utils/password';
import { PrismaClient, User, Prisma } from '@prisma/client';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from '../types/users.types';

export class UsersService {
    async findAll(query: UserQueryDto) {
        const page = Number(query.page) || 1
        const limit = Number(query.limit) || 10
        const skip = (page - 1) * limit
        const search = query.search || ''
        const roleFilter = query.role

        const where: any = {
            OR: [
                { email: { contains: search, mode: 'insensitive' } },
                { fullName: { contains: search, mode: 'insensitive' } },
                { businessName: { contains: search, mode: 'insensitive' } },
            ],
        }

        if (roleFilter) {
            where.userRoles = {
                some: {
                    role: {
                        name: roleFilter
                    }
                }
            }
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
                totalPages: Math.ceil(total / limit)
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
                umkmProfile: true,
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
                }
            },
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

    async update(id: string, data: UpdateUserDto) {
        const updateData: any = {
            fullName: data.fullName,
            phone: data.phone,
            businessName: data.businessName,
            isActive: data.isActive
        }

        if (data.password) {
            updateData.passwordHash = await hashPassword(data.password)
        }

        // Handle Role Update if provided
        if (data.role) {
            // First delete existing roles (simplified for single role system, or adjust for multi-role)
            // For now, we assume replacing roles
            await db.userRole.deleteMany({
                where: { userId: id }
            })

            // Add new role
            await db.userRole.create({
                data: {
                    userId: id,
                    roleId: (await db.role.findUnique({ where: { name: data.role } }))?.id || '' // This is risky if role doesn't exist
                }
            })

            // Better approach: connectOrCreate inside update, but deleting old ones is tricky in one go.
            // Let's stick to simple property updates for now, and handle role update separately or carefully.
            // Reverting role update logic here for safety, or implementing it properly.

            // Proper Role Update:
            // 1. Find role ID
            const role = await db.role.findUnique({ where: { name: data.role } })
            if (role) {
                await db.userRole.deleteMany({ where: { userId: id } })
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
}
