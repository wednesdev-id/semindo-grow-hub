import { ReactNode } from 'react'
import { useAuth } from '@/contexts/AuthContext'

interface CanProps {
    permission?: string
    permissions?: string[] // Any of these permissions
    role?: string
    roles?: string[] // Any of these roles
    children: ReactNode
    fallback?: ReactNode
}

/**
 * Conditional rendering component based on user permissions and roles
 * 
 * @example
 * <Can permission="edit-umkm-profile">
 *   <button>Edit Profile</button>
 * </Can>
 * 
 * @example
 * <Can roles={['admin', 'super_admin']} fallback={<p>Access Denied</p>}>
 *   <AdminPanel />
 * </Can>
 */
export function Can({
    permission,
    permissions,
    role,
    roles,
    children,
    fallback = null
}: CanProps) {
    const { hasPermission, hasRole, hasAnyPermission, hasAnyRole } = useAuth()

    // Check permissions
    const hasRequiredPermission =
        !permission || hasPermission(permission)

    const hasRequiredPermissions =
        !permissions || hasAnyPermission(permissions)

    // Check roles
    const hasRequiredRole =
        !role || hasRole(role)

    const hasRequiredRoles =
        !roles || hasAnyRole(roles)

    // Grant access if all checks pass
    const canAccess =
        hasRequiredPermission &&
        hasRequiredPermissions &&
        hasRequiredRole &&
        hasRequiredRoles

    return canAccess ? <>{children}</> : <>{fallback}</>
}
