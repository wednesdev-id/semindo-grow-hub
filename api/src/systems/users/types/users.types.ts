export interface CreateUserDto {
    email: string
    password: string
    fullName: string
    role: string
    phone?: string
    businessName?: string
}

export interface UpdateUserDto {
    fullName?: string
    phone?: string
    businessName?: string
    isActive?: boolean
    password?: string
    role?: string // To update role
}

export interface UserQueryDto {
    page?: number
    limit?: number
    search?: string
    role?: string
}
