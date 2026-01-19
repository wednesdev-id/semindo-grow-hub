"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const db_1 = require("../../utils/db");
class AuditService {
    async createLog(data) {
        try {
            const log = await db_1.db.auditLog.create({
                data: {
                    userId: data.userId,
                    action: data.action,
                    resource: data.resource,
                    resourceId: data.resourceId,
                    oldValue: data.oldValue,
                    newValue: data.newValue,
                    ipAddress: data.ipAddress,
                    userAgent: data.userAgent,
                }
            });
            return log;
        }
        catch (error) {
            console.error('Failed to create audit log:', error);
            // Don't throw error - audit logging should not break the main flow
            return null;
        }
    }
    async findAll(filters = {}) {
        const { page = 1, limit = 50, userId, action, resource, resourceId, startDate, endDate, search } = filters;
        const skip = (page - 1) * limit;
        // Build where clause
        const where = {};
        if (userId)
            where.userId = userId;
        if (action)
            where.action = action;
        if (resource)
            where.resource = resource;
        if (resourceId)
            where.resourceId = resourceId;
        if (startDate || endDate) {
            where.createdAt = {};
            if (startDate)
                where.createdAt.gte = startDate;
            if (endDate)
                where.createdAt.lte = endDate;
        }
        // Search in old/new values (JSON search)
        if (search) {
            // This is a simple implementation - for production, consider full-text search
            where.OR = [
                { action: { contains: search, mode: 'insensitive' } },
                { resource: { contains: search, mode: 'insensitive' } },
            ];
        }
        const [logs, total] = await Promise.all([
            db_1.db.auditLog.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    user: {
                        select: {
                            id: true,
                            email: true,
                            fullName: true,
                        }
                    }
                }
            }),
            db_1.db.auditLog.count({ where })
        ]);
        return {
            data: logs,
            meta: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        };
    }
    async findById(id) {
        const log = await db_1.db.auditLog.findUnique({
            where: { id },
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                        fullName: true,
                    }
                }
            }
        });
        if (!log)
            throw new Error('Audit log not found');
        return log;
    }
    async getUserActivity(userId, filters = {}) {
        return this.findAll({
            ...filters,
            userId
        });
    }
    async getResourceHistory(resource, resourceId, filters = {}) {
        return this.findAll({
            ...filters,
            resource,
            resourceId
        });
    }
    async exportLogs(filters = {}) {
        // Get all logs without pagination for export
        const { data } = await this.findAll({
            ...filters,
            limit: 10000 // Max export limit
        });
        // Convert to CSV format
        const headers = ['Date', 'User', 'Action', 'Resource', 'Resource ID', 'IP Address'];
        const rows = data.map(log => [
            log.createdAt.toISOString(),
            log.user?.email || 'System',
            log.action,
            log.resource,
            log.resourceId || '',
            log.ipAddress || ''
        ]);
        const csv = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
        return csv;
    }
    // Helper method to log user actions
    async logUserAction(userId, action, resource, resourceId, oldValue, newValue, req) {
        return this.createLog({
            userId,
            action,
            resource,
            resourceId,
            oldValue,
            newValue,
            ipAddress: req?.ip || req?.connection?.remoteAddress,
            userAgent: req?.get?.('user-agent')
        });
    }
}
exports.AuditService = AuditService;
