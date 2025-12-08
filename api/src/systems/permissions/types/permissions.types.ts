export interface CreatePermissionDto {
    name: string;
    displayName: string;
    description?: string;
}

export interface UpdatePermissionDto {
    displayName?: string;
    description?: string;
}
