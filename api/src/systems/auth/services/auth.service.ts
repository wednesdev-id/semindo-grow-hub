import { db } from '../../utils/db';
import { PrismaClient, User } from '../../../../prisma/generated/client';
import { hashPassword, comparePassword } from '../../utils/password';
import { signToken } from '../../utils/jwt';
import { LoginDto, RegisterDto, AuthResponse } from '../types/auth.types';

export class AuthService {
    async register(data: RegisterDto): Promise<AuthResponse> {
        // Check if user exists
        const existingUser = await db.user.findUnique({
            where: { email: data.email }
        })

        if (existingUser) {
            throw new Error('Email already registered')
        }

        // Hash password
        const passwordHash = await hashPassword(data.password)

        // Create user
        const user = await db.user.create({
            data: {
                email: data.email,
                passwordHash,
                fullName: data.fullName,
                phone: data.phone,
                businessName: data.businessName,
                // Assign default role 'umkm'
                userRoles: {
                    create: {
                        role: {
                            connectOrCreate: {
                                where: { name: 'umkm' },
                                create: {
                                    name: 'umkm',
                                    displayName: 'UMKM',
                                    description: 'UMKM Business Owner'
                                }
                            }
                        }
                    }
                }
            },
            include: {
                userRoles: {
                    include: {
                        role: {
                            include: {
                                rolePermissions: {
                                    include: {
                                        permission: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        // Generate token
        const roles = user.userRoles.map(ur => ur.role.name) as string[]
        const permissions = Array.from(new Set(
            user.userRoles.flatMap(ur =>
                ur.role.rolePermissions.map(rp => rp.permission.name)
            )
        )) as string[]

        const token = signToken({
            userId: user.id,
            email: user.email,
            roles
        })

        return {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                roles,
                permissions
            },
            token,
            expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        }
    }

    async login(data: LoginDto): Promise<AuthResponse> {
        console.log(`[AuthDebug] Login attempt for: ${data.email}`);
        // Find user
        const user = await db.user.findUnique({
            where: { email: data.email },
            include: {
                userRoles: {
                    include: {
                        role: {
                            include: {
                                rolePermissions: {
                                    include: {
                                        permission: true
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })

        if (!user) {
            console.log(`[AuthDebug] User not found: ${data.email}`);
            throw new Error('Invalid email or password')
        }

        console.log(`[AuthDebug] User found. Hash: ${user.passwordHash.substring(0, 10)}...`);
        console.log(`[AuthDebug] Input password length: ${data.password.length}`);

        // Verify password
        const isValid = await comparePassword(data.password, user.passwordHash)
        console.log(`[AuthDebug] Password valid: ${isValid}`);

        if (!isValid) {
            throw new Error('Invalid email or password')
        }

        // Generate token
        const roles = user.userRoles.map(ur => ur.role.name) as string[]
        const permissions = Array.from(new Set(
            user.userRoles.flatMap(ur =>
                ur.role.rolePermissions.map(rp => rp.permission.name)
            )
        )) as string[]

        const token = signToken({
            userId: user.id,
            email: user.email,
            roles
        })

        return {
            user: {
                id: user.id,
                email: user.email,
                fullName: user.fullName,
                roles,
                permissions
            },
            token,
            expiresIn: process.env.JWT_EXPIRES_IN || '24h'
        }
    }

    async getMe(userId: string) {
        const user = await db.user.findUnique({
            where: { id: userId },
            include: {
                userRoles: {
                    include: {
                        role: {
                            include: {
                                rolePermissions: {
                                    include: {
                                        permission: true
                                    }
                                }
                            }
                        }
                    }
                },
                umkmProfiles: true,
                mentorProfile: true
            }
        })

        if (!user) {
            throw new Error('User not found')
        }

        const roles = user.userRoles.map(ur => ur.role.name) as string[]
        const permissions = Array.from(new Set(
            user.userRoles.flatMap(ur =>
                ur.role.rolePermissions.map(rp => rp.permission.name)
            )
        )) as string[]

        return {
            id: user.id,
            email: user.email,
            fullName: user.fullName,
            phone: user.phone,
            roles,
            permissions,
            umkmProfiles: user.umkmProfiles,
            mentorProfile: user.mentorProfile
        }
    }
}
