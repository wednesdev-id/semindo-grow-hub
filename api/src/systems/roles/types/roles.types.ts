export interface CreateRoleDto {
    name: string;
    displayName: string;
    description?: string;
}

export interface UpdateRoleDto {
    displayName?: string;
    description?: string;
}

export interface AssignPermissionsDto {
    permissionIds: string[];
}
