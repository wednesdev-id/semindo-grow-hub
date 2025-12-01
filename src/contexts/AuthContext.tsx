import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, Role, Permission, AuthState, LoginResponse } from '@/types/auth'

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<void>
    register: (data: any) => Promise<void>
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
    const [roles, setRoles] = useState<string[]>([])
    const [permissions, setPermissions] = useState<string[]>([])
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
        console.log(`[Auth] Attempting login for: ${email} at ${new Date().toISOString()} `)
        setIsLoading(true)
        try {
            // Using fetch directly here to avoid circular dependency if api.ts uses AuthContext
            // But ideally should use api service. For now, improving logging.
            const response = await fetch('/api/v1/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            })

            const data = await response.json()

            if (!response.ok) {
                console.error(`[Auth] Login failed.Status: ${response.status} ${response.statusText}.Error: `, data.error)
                console.error(`[Auth] Response body: `, data)
                throw new Error(data.error || `Login failed(${response.status})`)
            }

            console.log(`[Auth] Login successful for user: ${data.data.user.email} `)
            const { user: userData, token } = data.data

            // Extract roles and permissions from user data
            const userRoles = userData.roles || []
            const userPermissions = userData.permissions || []

            // Store in localStorage
            localStorage.setItem('auth_token', token)
            localStorage.setItem('auth_user', JSON.stringify(userData))
            localStorage.setItem('auth_roles', JSON.stringify(userRoles))
            localStorage.setItem('auth_permissions', JSON.stringify(userPermissions))

            // Update state
            setUser(userData)
            setRoles(userRoles)
            setPermissions(userPermissions)
            setIsAuthenticated(true)

            return userData
        } catch (error) {
            console.error(`[Auth] Login error at ${new Date().toISOString()}: `, error)
            throw error
        } finally {
            setIsLoading(false)
        }
    }

    const register = async (data: any) => {
        console.log(`[Auth] Attempting registration for: ${data.email} `)
        setIsLoading(true)
        try {
            const response = await fetch('/api/v1/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            })

            const responseData = await response.json()

            if (!response.ok) {
                throw new Error(responseData.error || `Registration failed(${response.status})`)
            }

            console.log(`[Auth] Registration successful for user: ${responseData.data.user.email} `)
            // Auto login after register? Usually yes, or redirect to login.
            // The backend register response might include token.
            // AuthService.ts says it stores tokens.

            const { user: userData, token } = responseData.data

            // Extract roles and permissions from user data
            const userRoles = userData.roles || []
            const userPermissions = userData.permissions || []

            // Store in localStorage
            localStorage.setItem('auth_token', token)
            localStorage.setItem('auth_user', JSON.stringify(userData))
            localStorage.setItem('auth_roles', JSON.stringify(userRoles))
            localStorage.setItem('auth_permissions', JSON.stringify(userPermissions))

            // Update state
            setUser(userData)
            setRoles(userRoles)
            setPermissions(userPermissions)
            setIsAuthenticated(true)

            return userData
        } catch (error) {
            console.error(`[Auth] Registration error: `, error)
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
        return permissions.includes(permissionName)
    }

    const hasRole = (roleName: string): boolean => {
        return roles.includes(roleName)
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
        register,
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
