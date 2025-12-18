import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, Role, Permission, AuthState, LoginResponse } from '@/types/auth'
import { api } from '@/services/api'
import { useNavigate } from 'react-router-dom'

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => Promise<User>
    register: (data: any) => Promise<User>
    logout: () => void
    hasPermission: (permission: string) => boolean
    hasRole: (role: string) => boolean
    hasAnyPermission: (permissions: string[]) => boolean
    hasAnyRole: (roles: string[]) => boolean
}

export const AuthContext = createContext<AuthContextType | null>(null)

interface AuthProviderProps {
    children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [user, setUser] = useState<User | null>(null)
    const [roles, setRoles] = useState<string[]>([])
    const [permissions, setPermissions] = useState<string[]>([])
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const navigate = useNavigate()

    // Auto-logout configuration
    const AUTO_LOGOUT_TIME = 2 * 60 * 60 * 1000; // 2 hours in milliseconds
    let logoutTimer: NodeJS.Timeout;

    const resetLogoutTimer = () => {
        if (logoutTimer) clearTimeout(logoutTimer);
        if (isAuthenticated) {
            logoutTimer = setTimeout(() => {
                console.log('[Auth] Auto-logout due to inactivity');
                logout();
            }, AUTO_LOGOUT_TIME);
        }
    };

    // Setup activity listeners
    useEffect(() => {
        const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'];

        const handleActivity = () => {
            resetLogoutTimer();
        };

        if (isAuthenticated) {
            events.forEach(event => {
                window.addEventListener(event, handleActivity);
            });
            resetLogoutTimer(); // Start timer initially
        }

        return () => {
            if (logoutTimer) clearTimeout(logoutTimer);
            events.forEach(event => {
                window.removeEventListener(event, handleActivity);
            });
        };
    }, [isAuthenticated]);

    // Load auth state from sessionStorage on mount
    useEffect(() => {
        const loadAuthState = () => {
            try {
                const token = sessionStorage.getItem('auth_token')
                const storedUser = sessionStorage.getItem('auth_user')
                const storedRoles = sessionStorage.getItem('auth_roles')
                const storedPermissions = sessionStorage.getItem('auth_permissions')

                if (token && storedUser) {
                    setUser(JSON.parse(storedUser))
                    setRoles(storedRoles ? JSON.parse(storedRoles) : [])
                    setPermissions(storedPermissions ? JSON.parse(storedPermissions) : [])
                    setIsAuthenticated(true)
                }
            } catch (error) {
                console.error('Error loading auth state:', error)
                // Clear invalid data
                sessionStorage.removeItem('auth_token')
                sessionStorage.removeItem('auth_user')
                sessionStorage.removeItem('auth_roles')
                sessionStorage.removeItem('auth_permissions')
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
            const data = await api.post<LoginResponse>('/auth/login', { email, password })

            console.log(`[Auth] Login successful for user: ${data.data.user.email} `)
            const { user: userData, token } = data.data

            // Extract roles and permissions from user data
            const userRoles = userData.roles || []
            const userPermissions = userData.permissions || []

            // Store in sessionStorage
            sessionStorage.setItem('auth_token', token)
            sessionStorage.setItem('auth_user', JSON.stringify(userData))
            sessionStorage.setItem('auth_roles', JSON.stringify(userRoles))
            sessionStorage.setItem('auth_permissions', JSON.stringify(userPermissions))

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
            const responseData = await api.post<LoginResponse>('/auth/register', data)

            console.log(`[Auth] Registration successful for user: ${responseData.data.user.email} `)

            const { user: userData, token } = responseData.data

            // Extract roles and permissions from user data
            const userRoles = userData.roles || []
            const userPermissions = userData.permissions || []

            // Store in sessionStorage
            sessionStorage.setItem('auth_token', token)
            sessionStorage.setItem('auth_user', JSON.stringify(userData))
            sessionStorage.setItem('auth_roles', JSON.stringify(userRoles))
            sessionStorage.setItem('auth_permissions', JSON.stringify(userPermissions))

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
        sessionStorage.removeItem('auth_token')
        sessionStorage.removeItem('auth_user')
        sessionStorage.removeItem('auth_roles')
        sessionStorage.removeItem('auth_permissions')

        // Reset state
        setUser(null)
        setRoles([])
        setPermissions([])
        setIsAuthenticated(false)

        // Redirect to login
        navigate('/login');
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
