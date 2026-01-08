// RBAC Types for Semindo Platform
export interface User {
  id: string
  email: string
  fullName: string
  phone?: string
  businessName?: string
  profilePictureUrl?: string
  isActive: boolean
  isVerified: boolean
  emailVerifiedAt?: Date
  lastLoginAt?: Date
  createdAt: Date
  updatedAt: Date
  roles?: string[]
  permissions?: string[]
  umkmProfile?: UMKMProfile
  mentorProfile?: MentorProfile
}

export interface Role {
  id: string
  name: 'umkm' | 'konsultan' | 'admin' | 'super_admin' | 'finance_partner' | 'ecosystem_partner'
  display_name: string
  description?: string
  level: number // 1=lowest (umkm), 5=highest (super_admin)
  is_active: boolean
  created_at: Date
}

export interface Permission {
  id: string
  name: string // kebab-case: view-umkm-profile, edit-umkm-profile
  resource: string // umkm_profile, assessment, lms, consultation, etc
  action: string // view, create, edit, delete, approve
  description?: string
  created_at: Date
}

export interface UserRole {
  user_id: string
  role_id: string
  role: Role
  assigned_at: Date
  assigned_by?: string
  expires_at?: Date
}

export interface RolePermission {
  role_id: string
  permission_id: string
  permission: Permission
  granted_at: Date
  granted_by?: string
}

export interface AuditLog {
  id: string
  user_id?: string
  action: string
  resource: string
  resource_id?: string
  old_value?: Record<string, any>
  new_value?: Record<string, any>
  ip_address?: string
  user_agent?: string
  created_at: Date
}

// Auth Response Types
export interface LoginResponse {
  success: boolean
  message?: string
  data: {
    token: string
    user: User
    expiresIn?: string
  }
}

export interface UMKMProfile {
  id: string
  userId: string
  businessName?: string
  ownerName?: string
  address?: string
  city?: string
  province?: string
  postalCode?: string
  phone?: string
  email?: string
  website?: string
  description?: string
  sector?: string
  yearEstablished?: number
  employeeCount?: number
  annualRevenue?: number
  assetsValue?: number
  legalEntity?: string
  nib?: string
  level?: string
  isVerified: boolean
  location?: { lat: number; lng: number; address?: string }
}

export interface MentorProfile {
  id: string
  userId: string
  specialization?: string
  experience?: number
  bio?: string
  isVerified: boolean
}

export interface ProfileResponse {
  user: User
  umkm?: UMKMProfile
  mentor?: MentorProfile
}

export interface AuthState {
  user: User | null
  roles: string[]
  permissions: string[]
  isAuthenticated: boolean
  isLoading: boolean
}
