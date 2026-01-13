import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
    children: ReactNode
    requiredPermission?: string
    requiredPermissions?: string[] // Any of these permissions
    requiredRole?: string
    requiredRoles?: string[] // Any of these roles
    fallback?: string
}

export function ProtectedRoute({
    children,
    requiredPermission,
    requiredPermissions,
    requiredRole,
    requiredRoles,
    fallback = '/unauthorized'
}: ProtectedRouteProps) {
    const { user, isLoading, hasPermission, hasRole, hasAnyPermission, hasAnyRole } = useAuth()
    const location = useLocation()

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
            </div>
        )
    }

    // Redirect to login if not authenticated
    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    // Check single permission
    if (requiredPermission && !hasPermission(requiredPermission)) {
        return <Navigate to={fallback} replace />
    }

    // Check multiple permissions (any)
    if (requiredPermissions && !hasAnyPermission(requiredPermissions)) {
        return <Navigate to={fallback} replace />
    }

    // Check single role
    if (requiredRole && !hasRole(requiredRole)) {
        return <Navigate to={fallback} replace />
    }

    // Check multiple roles (any)
    if (requiredRoles && !hasAnyRole(requiredRoles)) {
        return <Navigate to={fallback} replace />
    }

    return <>{children}</>
}
