import { api } from './api';

export interface AuditLog {
    id: string;
    userId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    oldValue?: any;
    newValue?: any;
    ipAddress?: string;
    userAgent?: string;
    createdAt: Date;
    user?: {
        id: string;
        email: string;
        fullName: string;
    };
}

export interface AuditLogFilters {
    page?: number;
    limit?: number;
    userId?: string;
    action?: string;
    resource?: string;
    resourceId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
}

export const auditService = {
    // Get all logs with filters
    getAllLogs: (filters?: AuditLogFilters) => {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    params.append(key, value.toString());
                }
            });
        }
        return api.get(`/audit-logs?${params.toString()}`);
    },

    // Get log by ID
    getLogById: (id: string) => api.get(`/audit-logs/${id}`),

    // Get user activity
    getUserActivity: (userId: string, filters?: AuditLogFilters) => {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    params.append(key, value.toString());
                }
            });
        }
        return api.get(`/audit-logs/user/${userId}?${params.toString()}`);
    },

    // Get resource history
    getResourceHistory: (resource: string, resourceId: string, filters?: AuditLogFilters) => {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    params.append(key, value.toString());
                }
            });
        }
        return api.get(`/audit-logs/resource/${resource}/${resourceId}?${params.toString()}`);
    },

    // Export logs to CSV
    exportLogs: async (filters?: AuditLogFilters) => {
        const params = new URLSearchParams();
        if (filters) {
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    params.append(key, value.toString());
                }
            });
        }

        const response = await fetch(`${import.meta.env.VITE_API_URL}/audit-logs/export?${params.toString()}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) throw new Error('Export failed');

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    }
};
