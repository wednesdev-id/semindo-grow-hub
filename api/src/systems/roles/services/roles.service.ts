import { db } from '../../utils/db';
import { CreateRoleDto, UpdateRoleDto } from '../types/roles.types';

export class RolesService {
    async findAll() {
        const roles = await db.role.findMany({
            include: {
                rolePermissions: {
                    include: {
                        permission: true
                    }
                },
                userRoles: {
                    select: {
                        userId: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return roles.map(role => ({
            ...role,
            permissionsCount: role.rolePermissions.length,
            usersCount: role.userRoles.length,
            permissions: role.rolePermissions.map(rp => rp.permission),
            rolePermissions: undefined,
            userRoles: undefined
        }));
    }

    async findById(id: string) {
        const role = await db.role.findUnique({
            where: { id },
            include: {
                rolePermissions: {
                    include: {
                        permission: true
                    }
                },
                userRoles: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                fullName: true,
                                isActive: true
                            }
                        }
                    }
                }
            }
        });

        if (!role) throw new Error('Role not found');

        return {
            ...role,
            permissions: role.rolePermissions.map(rp => rp.permission),
            users: role.userRoles.map(ur => ur.user),
            rolePermissions: undefined,
            userRoles: undefined
        };
    }

    async create(data: CreateRoleDto) {
        // Check if role name already exists
        const existing = await db.role.findUnique({
            where: { name: data.name }
        });

        if (existing) throw new Error('Role name already exists');

        const role = await db.role.create({
            data: {
                name: data.name,
                displayName: data.displayName,
                description: data.description
            }
        });

        return role;
    }

    async update(id: string, data: UpdateRoleDto) {
        // Check if role exists
        const role = await db.role.findUnique({ where: { id } });
        if (!role) throw new Error('Role not found');

        // Prevent updating system roles
        const systemRoles = ['admin', 'super_admin', 'umkm', 'mentor'];
        if (systemRoles.includes(role.name)) {
            throw new Error('Cannot update system role');
        }

        const updated = await db.role.update({
            where: { id },
            data: {
                displayName: data.displayName,
                description: data.description
            }
        });

        return updated;
    }

    async delete(id: string) {
        // Check if role exists
        const role = await db.role.findUnique({
            where: { id },
            include: {
                userRoles: true
            }
        });

        if (!role) throw new Error('Role not found');

        // Prevent deleting system roles
        const systemRoles = ['admin', 'super_admin', 'umkm', 'mentor'];
        if (systemRoles.includes(role.name)) {
            throw new Error('Cannot delete system role');
        }

        // Prevent deleting role with users
        if (role.userRoles.length > 0) {
            throw new Error(`Cannot delete role with ${role.userRoles.length} assigned users`);
        }

        await db.role.delete({ where: { id } });

        return { message: 'Role deleted successfully' };
    }

    async getUsersByRole(roleId: string) {
        const role = await db.role.findUnique({
            where: { id: roleId },
            include: {
                userRoles: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                email: true,
                                fullName: true,
                                phone: true,
                                businessName: true,
                                isActive: true,
                                createdAt: true
                            }
                        }
                    }
                }
            }
        });

        if (!role) throw new Error('Role not found');

        return role.userRoles.map(ur => ur.user);
    }

    async getRolePermissions(roleId: string) {
        const role = await db.role.findUnique({
            where: { id: roleId },
            include: {
                rolePermissions: {
                    include: {
                        permission: true
                    }
                }
            }
        });

        if (!role) throw new Error('Role not found');

        return role.rolePermissions.map(rp => rp.permission);
    }

    async assignPermissions(roleId: string, permissionIds: string[]) {
        // Check if role exists
        const role = await db.role.findUnique({ where: { id: roleId } });
        if (!role) throw new Error('Role not found');

        // Delete existing permissions
        await db.rolePermission.deleteMany({
            where: { roleId }
        });

        // Create new permissions
        const rolePermissions = await db.rolePermission.createMany({
            data: permissionIds.map(permissionId => ({
                roleId,
                permissionId
            }))
        });

        return { message: `Assigned ${permissionIds.length} permissions to role` };
    }

    async removePermission(roleId: string, permissionId: string) {
        const deleted = await db.rolePermission.deleteMany({
            where: {
                roleId,
                permissionId
            }
        });

        if (deleted.count === 0) {
            throw new Error('Permission not found for this role');
        }

        return { message: 'Permission removed from role' };
    }
}
