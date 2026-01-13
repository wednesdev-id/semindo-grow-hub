import { api } from './api';

export interface Role {
    id: string;
    name: string;
    displayName: string;
    description?: string;
    permissionsCount?: number;
    usersCount?: number;
    permissions?: Permission[];
    users?: any[];
    createdAt: Date;
}

export interface Permission {
    id: string;
    name: string;
    displayName: string;
    description?: string;
    roles?: Role[];
    createdAt: Date;
}

export interface CreateRoleData {
    name: string;
    displayName: string;
    description?: string;
}

export interface UpdateRoleData {
    displayName?: string;
    description?: string;
}

export interface CreatePermissionData {
    name: string;
    displayName: string;
    description?: string;
}

export interface UpdatePermissionData {
    displayName?: string;
    description?: string;
}

export const roleService = {
    // Role CRUD
    getAllRoles: () => api.get<{ data: Role[] }>('/roles'),
    getRoleById: (id: string) => api.get(`/roles/${id}`),
    createRole: (data: CreateRoleData) => api.post('/roles', data),
    updateRole: (id: string, data: UpdateRoleData) => api.patch(`/roles/${id}`, data),
    deleteRole: (id: string) => api.delete(`/roles/${id}`),

    // Role Users
    getRoleUsers: (id: string) => api.get(`/roles/${id}/users`),

    // Role Permissions
    getRolePermissions: (id: string) => api.get(`/roles/${id}/permissions`),
    assignPermissions: (id: string, permissionIds: string[]) =>
        api.post(`/roles/${id}/permissions`, { permissionIds }),
    removePermission: (id: string, permissionId: string) =>
        api.delete(`/roles/${id}/permissions/${permissionId}`),
};

export const permissionService = {
    // Permission CRUD
    getAllPermissions: () => api.get('/permissions'),
    getPermissionById: (id: string) => api.get(`/permissions/${id}`),
    createPermission: (data: CreatePermissionData) => api.post('/permissions', data),
    updatePermission: (id: string, data: UpdatePermissionData) => api.patch(`/permissions/${id}`, data),
    deletePermission: (id: string) => api.delete(`/permissions/${id}`),
};

export const userRoleService = {
    // User-Role Management
    assignRoles: (userId: string, roleIds: string[]) =>
        api.post(`/users/${userId}/roles`, { roleIds }),
    removeRole: (userId: string, roleId: string) =>
        api.delete(`/users/${userId}/roles/${roleId}`),
};
