import { db } from '../../utils/db';
import { CreatePermissionDto, UpdatePermissionDto } from '../types/permissions.types';

export class PermissionsService {
    async findAll() {
        const permissions = await db.permission.findMany({
            include: {
                rolePermissions: {
                    include: {
                        role: {
                            select: {
                                id: true,
                                name: true,
                                displayName: true
                            }
                        }
                    }
                }
            },
            orderBy: { name: 'asc' }
        });

        return permissions.map(permission => ({
            ...permission,
            roles: permission.rolePermissions.map(rp => rp.role),
            rolePermissions: undefined
        }));
    }

    async findById(id: string) {
        const permission = await db.permission.findUnique({
            where: { id },
            include: {
                rolePermissions: {
                    include: {
                        role: true
                    }
                }
            }
        });

        if (!permission) throw new Error('Permission not found');

        return {
            ...permission,
            roles: permission.rolePermissions.map(rp => rp.role),
            rolePermissions: undefined
        };
    }

    async create(data: CreatePermissionDto) {
        // Check if permission name already exists
        const existing = await db.permission.findUnique({
            where: { name: data.name }
        });

        if (existing) throw new Error('Permission name already exists');

        const permission = await db.permission.create({
            data: {
                name: data.name,
                displayName: data.displayName,
                description: data.description
            }
        });

        return permission;
    }

    async update(id: string, data: UpdatePermissionDto) {
        // Check if permission exists
        const permission = await db.permission.findUnique({ where: { id } });
        if (!permission) throw new Error('Permission not found');

        const updated = await db.permission.update({
            where: { id },
            data: {
                displayName: data.displayName,
                description: data.description
            }
        });

        return updated;
    }

    async delete(id: string) {
        // Check if permission exists
        const permission = await db.permission.findUnique({
            where: { id },
            include: {
                rolePermissions: true
            }
        });

        if (!permission) throw new Error('Permission not found');

        // Prevent deleting permission with roles
        if (permission.rolePermissions.length > 0) {
            throw new Error(`Cannot delete permission assigned to ${permission.rolePermissions.length} roles`);
        }

        await db.permission.delete({ where: { id } });

        return { message: 'Permission deleted successfully' };
    }
}
