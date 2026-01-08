import { db } from '../../utils/db';
import { AuditService } from '../../audit/services/audit.service';

export class BulkOperationsService {
    private auditService = new AuditService();

    async bulkDelete(userIds: string[], performedBy?: string) {
        const results = {
            deleted: 0,
            failed: 0,
            errors: [] as Array<{ userId: string; error: string }>
        };

        // Validate: prevent deleting self or system users
        const users = await db.user.findMany({
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
                const isSystemAdmin = user.userRoles.some(ur =>
                    ur.role.name === 'super_admin'
                );

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
                await db.user.delete({
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
            } catch (error: any) {
                results.failed++;
                results.errors.push({
                    userId: user.id,
                    error: error.message
                });
            }
        }

        return results;
    }

    async bulkActivate(userIds: string[], performedBy?: string) {
        const results = {
            activated: 0,
            failed: 0,
            errors: [] as Array<{ userId: string; error: string }>
        };

        for (const userId of userIds) {
            try {
                const user = await db.user.update({
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
            } catch (error: any) {
                results.failed++;
                results.errors.push({
                    userId,
                    error: error.message
                });
            }
        }

        return results;
    }

    async bulkDeactivate(userIds: string[], performedBy?: string) {
        const results = {
            deactivated: 0,
            failed: 0,
            errors: [] as Array<{ userId: string; error: string }>
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

                const user = await db.user.update({
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
            } catch (error: any) {
                results.failed++;
                results.errors.push({
                    userId,
                    error: error.message
                });
            }
        }

        return results;
    }

    async bulkAssignRoles(userIds: string[], roleIds: string[], performedBy?: string) {
        const results = {
            assigned: 0,
            failed: 0,
            errors: [] as Array<{ userId: string; error: string }>
        };

        // Validate roles exist
        const roles = await db.role.findMany({
            where: { id: { in: roleIds } }
        });

        if (roles.length !== roleIds.length) {
            throw new Error('One or more roles not found');
        }

        for (const userId of userIds) {
            try {
                // Delete existing roles
                await db.userRole.deleteMany({
                    where: { userId }
                });

                // Assign new roles
                await db.userRole.createMany({
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
            } catch (error: any) {
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
