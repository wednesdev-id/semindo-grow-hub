"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PermissionsService = void 0;
const db_1 = require("../../utils/db");
class PermissionsService {
    async findAll() {
        const permissions = await db_1.db.permission.findMany({
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
    async findById(id) {
        const permission = await db_1.db.permission.findUnique({
            where: { id },
            include: {
                rolePermissions: {
                    include: {
                        role: true
                    }
                }
            }
        });
        if (!permission)
            throw new Error('Permission not found');
        return {
            ...permission,
            roles: permission.rolePermissions.map(rp => rp.role),
            rolePermissions: undefined
        };
    }
    async create(data) {
        // Check if permission name already exists
        const existing = await db_1.db.permission.findUnique({
            where: { name: data.name }
        });
        if (existing)
            throw new Error('Permission name already exists');
        const permission = await db_1.db.permission.create({
            data: {
                name: data.name,
                displayName: data.displayName,
                description: data.description
            }
        });
        return permission;
    }
    async update(id, data) {
        // Check if permission exists
        const permission = await db_1.db.permission.findUnique({ where: { id } });
        if (!permission)
            throw new Error('Permission not found');
        const updated = await db_1.db.permission.update({
            where: { id },
            data: {
                displayName: data.displayName,
                description: data.description
            }
        });
        return updated;
    }
    async delete(id) {
        // Check if permission exists
        const permission = await db_1.db.permission.findUnique({
            where: { id },
            include: {
                rolePermissions: true
            }
        });
        if (!permission)
            throw new Error('Permission not found');
        // Prevent deleting permission with roles
        if (permission.rolePermissions.length > 0) {
            throw new Error(`Cannot delete permission assigned to ${permission.rolePermissions.length} roles`);
        }
        await db_1.db.permission.delete({ where: { id } });
        return { message: 'Permission deleted successfully' };
    }
}
exports.PermissionsService = PermissionsService;
