"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const db_1 = require("../../utils/db");
const password_1 = require("../../utils/password");
class UsersService {
    async findAll(query) {
        const page = Number(query.page) || 1;
        const limit = Number(query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = query.search || '';
        const roleFilter = query.role;
        const isActiveFilter = query.isActive;
        const where = {
            OR: [
                { email: { contains: search, mode: 'insensitive' } },
                { fullName: { contains: search, mode: 'insensitive' } },
                { businessName: { contains: search, mode: 'insensitive' } },
            ],
        };
        if (roleFilter && roleFilter !== 'all') {
            where.userRoles = {
                some: {
                    role: {
                        name: roleFilter
                    }
                }
            };
        }
        if (isActiveFilter && isActiveFilter !== 'all') {
            where.isActive = isActiveFilter === 'true';
        }
        const [users, total] = await Promise.all([
            db_1.db.user.findMany({
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
            db_1.db.user.count({ where })
        ]);
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
        };
    }
    async findById(id) {
        const user = await db_1.db.user.findUnique({
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
        });
        if (!user)
            throw new Error('User not found');
        return {
            ...user,
            roles: user.userRoles.map(ur => ur.role.name),
            passwordHash: undefined
        };
    }
    async create(data) {
        const existingUser = await db_1.db.user.findUnique({
            where: { email: data.email }
        });
        if (existingUser)
            throw new Error('Email already registered');
        const passwordHash = await (0, password_1.hashPassword)(data.password);
        const user = await db_1.db.user.create({
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
        });
        return {
            ...user,
            roles: user.userRoles.map(ur => ur.role.name),
            passwordHash: undefined
        };
    }
    async update(id, data) {
        const updateData = {
            fullName: data.fullName,
            phone: data.phone,
            businessName: data.businessName,
            isActive: data.isActive
        };
        if (data.password) {
            updateData.passwordHash = await (0, password_1.hashPassword)(data.password);
        }
        // Handle Role Update if provided
        if (data.role) {
            const role = await db_1.db.role.findUnique({ where: { name: data.role } });
            if (role) {
                // Delete existing roles
                await db_1.db.userRole.deleteMany({
                    where: { userId: id }
                });
                // Add new role
                await db_1.db.userRole.create({
                    data: {
                        userId: id,
                        roleId: role.id
                    }
                });
            }
        }
        const user = await db_1.db.user.update({
            where: { id },
            data: updateData,
            include: {
                userRoles: {
                    include: { role: true }
                }
            }
        });
        return {
            ...user,
            roles: user.userRoles.map(ur => ur.role.name),
            passwordHash: undefined
        };
    }
    async delete(id) {
        await db_1.db.user.delete({
            where: { id }
        });
        return { message: 'User deleted successfully' };
    }
}
exports.UsersService = UsersService;
