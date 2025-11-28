// RBAC Types for Semindo Platform
export interface User {
  id: string
  email: string
  full_name: string
  phone?: string
  is_active: boolean
  is_verified: boolean
  email_verified_at?: Date
  last_login_at?: Date
  created_at: Date
  updated_at: Date
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
  token: string
  user: User
  roles: Role[]
  permissions: Permission[]
}

export interface AuthState {
  user: User | null
  roles: Role[]
  permissions: Permission[]
  isAuthenticated: boolean
  isLoading: boolean
}
