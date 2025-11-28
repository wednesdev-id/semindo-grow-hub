import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, Role, Permission, AuthState, LoginResponse } from '@/types/auth'

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<void>
    logout: () => void
    hasPermission: (permission: string) => boolean
    hasRole: (role: string) => boolean
    hasAnyPermission: (permissions: string[]) => boolean
    hasAnyRole: (roles: string[]) => boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
    children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null)
    const [roles, setRoles] = useState<Role[]>([])
    const [permissions, setPermissions] = useState<Permission[]>([])
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    // Load auth state from localStorage on mount
    useEffect(() => {
        const loadAuthState = () => {
            try {
                const token = localStorage.getItem('auth_token')
                const storedUser = localStorage.getItem('auth_user')
                const storedRoles = localStorage.getItem('auth_roles')
                const storedPermissions = localStorage.getItem('auth_permissions')

                if (token && storedUser) {
                    setUser(JSON.parse(storedUser))
                    setRoles(storedRoles ? JSON.parse(storedRoles) : [])
                    setPermissions(storedPermissions ? JSON.parse(storedPermissions) : [])
                    setIsAuthenticated(true)
                }
            } catch (error) {
                console.error('Error loading auth state:', error)
                // Clear invalid data
                localStorage.removeItem('auth_token')
                localStorage.removeItem('auth_user')
                localStorage.removeItem('auth_roles')
                localStorage.removeItem('auth_permissions')
            } finally {
                setIsLoading(false)
            }
        }

        loadAuthState()
    }, [])

    const login = async (email: string, password: string) => {
        setIsLoading(true)
        try {
            const response = await fetch('/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Login failed')
            }

            const { user: userData, token } = data.data

            localStorage.setItem('token', token)
            setUser(userData)
            setIsAuthenticated(true) // Set isAuthenticated on successful login
            return userData
        } catch (error) {
            console.error('Login error:', error)
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    const logout = () => {
        // Clear local storage
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
        localStorage.removeItem('auth_roles')
        localStorage.removeItem('auth_permissions')

        // Reset state
        setUser(null)
        setRoles([])
        setPermissions([])
        setIsAuthenticated(false)
    }

    const hasPermission = (permissionName: string): boolean => {
        return permissions.some(p => p.name === permissionName)
    }

    const hasRole = (roleName: string): boolean => {
        return roles.some(r => r.name === roleName)
    }

    const hasAnyPermission = (permissionNames: string[]): boolean => {
        return permissionNames.some(name => hasPermission(name))
    }

    const hasAnyRole = (roleNames: string[]): boolean => {
        return roleNames.some(name => hasRole(name))
    }

    const value: AuthContextType = {
        user,
        roles,
        permissions,
        isAuthenticated,
        isLoading,
        login,
        logout,
        hasPermission,
        hasRole,
        hasAnyPermission,
        hasAnyRole,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Custom hook to use auth context
export function useAuth() {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
