export interface RegisterDto {
    email: string
    password: string
    fullName: string
    phone?: string
    businessName?: string
}

export interface LoginDto {
    email: string
    password: string
}

export interface AuthResponse {
    user: {
        id: string
        email: string
        fullName: string
        roles: string[]
        permissions: string[]
    }
    token: string
    expiresIn: string
}
