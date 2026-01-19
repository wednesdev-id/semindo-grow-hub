"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BulkOperationsService = void 0;
const db_1 = require("../../utils/db");
const audit_service_1 = require("../../audit/services/audit.service");
class BulkOperationsService {
    constructor() {
        this.auditService = new audit_service_1.AuditService();
    }
    async bulkDelete(userIds, performedBy) {
        const results = {
            deleted: 0,
            failed: 0,
            errors: []
        };
        // Validate: prevent deleting self or system users
        const users = await db_1.db.user.findMany({
            where: { id: { in: userIds } },
            include: {
                userRoles: {
                    include: { role: true }
                }
            }
        });
        for (const user of users) {
            try {
                // Check if user is system admin
                const isSystemAdmin = user.userRoles.some(ur => ur.role.name === 'super_admin');
                if (isSystemAdmin) {
                    results.failed++;
                    results.errors.push({
                        userId: user.id,
                        error: 'Cannot delete system administrator'
                    });
                    continue;
                }
                // Check if deleting self
                if (user.id === performedBy) {
                    results.failed++;
                    results.errors.push({
                        userId: user.id,
                        error: 'Cannot delete yourself'
                    });
                    continue;
                }
                // Delete user
                await db_1.db.user.delete({
                    where: { id: user.id }
                });
                // Audit log
                await this.auditService.createLog({
                    userId: performedBy,
                    action: 'user.bulk_delete',
                    resource: 'user',
                    resourceId: user.id,
                    oldValue: {
                        email: user.email,
                        fullName: user.fullName
                    },
                    newValue: null
                });
                results.deleted++;
            }
            catch (error) {
                results.failed++;
                results.errors.push({
                    userId: user.id,
                    error: error.message
                });
            }
        }
        return results;
    }
    async bulkActivate(userIds, performedBy) {
        const results = {
            activated: 0,
            failed: 0,
            errors: []
        };
        for (const userId of userIds) {
            try {
                const user = await db_1.db.user.update({
                    where: { id: userId },
                    data: { isActive: true }
                });
                // Audit log
                await this.auditService.createLog({
                    userId: performedBy,
                    action: 'user.bulk_activate',
                    resource: 'user',
                    resourceId: userId,
                    oldValue: { isActive: false },
                    newValue: { isActive: true }
                });
                results.activated++;
            }
            catch (error) {
                results.failed++;
                results.errors.push({
                    userId,
                    error: error.message
                });
            }
        }
        return results;
    }
    async bulkDeactivate(userIds, performedBy) {
        const results = {
            deactivated: 0,
            failed: 0,
            errors: []
        };
        // Validate: prevent deactivating self
        for (const userId of userIds) {
            try {
                if (userId === performedBy) {
                    results.failed++;
                    results.errors.push({
                        userId,
                        error: 'Cannot deactivate yourself'
                    });
                    continue;
                }
                const user = await db_1.db.user.update({
                    where: { id: userId },
                    data: { isActive: false }
                });
                // Audit log
                await this.auditService.createLog({
                    userId: performedBy,
                    action: 'user.bulk_deactivate',
                    resource: 'user',
                    resourceId: userId,
                    oldValue: { isActive: true },
                    newValue: { isActive: false }
                });
                results.deactivated++;
            }
            catch (error) {
                results.failed++;
                results.errors.push({
                    userId,
                    error: error.message
                });
            }
        }
        return results;
    }
    async bulkAssignRoles(userIds, roleIds, performedBy) {
        const results = {
            assigned: 0,
            failed: 0,
            errors: []
        };
        // Validate roles exist
        const roles = await db_1.db.role.findMany({
            where: { id: { in: roleIds } }
        });
        if (roles.length !== roleIds.length) {
            throw new Error('One or more roles not found');
        }
        for (const userId of userIds) {
            try {
                // Delete existing roles
                await db_1.db.userRole.deleteMany({
                    where: { userId }
                });
                // Assign new roles
                await db_1.db.userRole.createMany({
                    data: roleIds.map(roleId => ({
                        userId,
                        roleId
                    }))
                });
                // Audit log
                await this.auditService.createLog({
                    userId: performedBy,
                    action: 'user.bulk_assign_roles',
                    resource: 'user',
                    resourceId: userId,
                    oldValue: null,
                    newValue: {
                        roleIds,
                        roleNames: roles.map(r => r.name)
                    }
                });
                results.assigned++;
            }
            catch (error) {
                results.failed++;
                results.errors.push({
                    userId,
                    error: error.message
                });
            }
        }
        return results;
    }
}
exports.BulkOperationsService = BulkOperationsService;
