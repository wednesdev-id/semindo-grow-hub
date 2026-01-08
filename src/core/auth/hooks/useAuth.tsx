/**
 * Auth Hook - React Hook for Authentication
 * Provides authentication state and methods for React components
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import {
  User,
  UserProfile,
  LoginCredentials,
  RegisterData,
  PasswordResetRequest,
  PasswordResetConfirm,
  OAuthProvider,
  UserRole,
  AuthResponse,
  ApiResponse
} from '../types';

import { AuthService } from '../services/AuthService';
import { TokenService } from '../services/TokenService';

// Auth State Interface
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

// Auth Hook Return Type
interface UseAuthReturn {
  // State
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Methods
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  confirmPasswordReset: (token: string, newPassword: string) => Promise<void>;
  oauthLogin: (provider: OAuthProvider) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;

  // Utilities
  hasRole: (role: UserRole) => boolean;
  hasPermission: (permission: string) => boolean;
  clearError: () => void;
}

// Props for AuthProvider
interface AuthProviderProps {
  children: React.ReactNode;
  authService: AuthService;
  tokenService: TokenService;
}

// Auth Context
import React from 'react';

const AuthContext = React.createContext<UseAuthReturn | undefined>(undefined);

/**
 * Auth Provider Component
 * Wraps the application and provides authentication context
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({
  children,
  authService,
  tokenService
}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

  // Current user query
  const { data: user, isLoading: isLoadingUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await authService.getCurrentUser();
      // Handle potential double-wrapping or inconsistent service return
      if (response && (response as any).success && (response as any).data) {
        return (response as any).data;
      }
      return response;
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    enabled: tokenService.hasToken(),
  });

  // Login mutation
  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const response = await authService.login(credentials);
      if (!response.success) {
        throw new Error(response.error?.message || 'Login failed');
      }
      return response.data!;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      const redirectPath = getRedirectPath(data.user.role);
      navigate(redirectPath);
    },
    onError: (error: Error) => {
      setError(error.message);
    }
  });

  // Register mutation
  const registerMutation = useMutation({
    mutationFn: async (data: RegisterData) => {
      const response = await authService.register(data);
      if (!response.success) {
        throw new Error(response.error?.message || 'Registration failed');
      }
      return response.data!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      navigate('/onboarding');
    },
    onError: (error: Error) => {
      setError(error.message);
    }
  });

  // Logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      return await authService.logout();
    },
    onSuccess: () => {
      queryClient.clear();
      navigate('/');
    },
    onError: (error: Error) => {
      setError(error.message);
    }
  });

  // Password reset mutation
  const passwordResetMutation = useMutation({
    mutationFn: async (email: string) => {
      const response = await authService.requestPasswordReset({ email });
      if (!response.success) {
        throw new Error(response.error?.message || 'Password reset failed');
      }
      return response;
    },
    onError: (error: Error) => {
      setError(error.message);
    }
  });

  // Password reset confirm mutation
  const passwordResetConfirmMutation = useMutation({
    mutationFn: async ({ token, newPassword }: { token: string; newPassword: string }) => {
      const response = await authService.confirmPasswordReset({ token, newPassword });
      if (!response.success) {
        throw new Error(response.error?.message || 'Password reset confirmation failed');
      }
      return response;
    },
    onSuccess: () => {
      navigate('/login?reset=success');
    },
    onError: (error: Error) => {
      setError(error.message);
    }
  });

  // OAuth login mutation
  const oauthMutation = useMutation({
    mutationFn: async (provider: OAuthProvider) => {
      const response = await authService.oauthLogin(provider);
      if (!response.success) {
        throw new Error(response.error?.message || 'OAuth login failed');
      }
      return response.data!;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      const redirectPath = getRedirectPath(data.user.role);
      navigate(redirectPath);
    },
    onError: (error: Error) => {
      setError(error.message);
    }
  });

  // Profile update mutation
  const profileUpdateMutation = useMutation({
    mutationFn: async (data: Partial<UserProfile>) => {
      if (!user) {
        throw new Error('No user logged in');
      }
      return await authService.updateProfile(user.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
    onError: (error: Error) => {
      setError(error.message);
    }
  });

  const authState: AuthState = {
    user: user || null,
    isAuthenticated: !!user,
    isLoading: isLoadingUser ||
      loginMutation.isPending ||
      registerMutation.isPending ||
      logoutMutation.isPending,
    error
  };

  const hasRole = useCallback((role: UserRole): boolean => {
    // Handle both singular role property (legacy) and roles array (new)
    if (authState.user?.roles && Array.isArray(authState.user.roles)) {
      return authState.user.roles.includes(role as any);
    }
    // Fallback for legacy user object structure or if types are inconsistent
    return (authState.user as any)?.role === role;
  }, [authState.user]);

  const hasPermission = useCallback((permission: string): boolean => {
    if (!authState.user) return false;
    const rolePermissions = getRolePermissions(authState.user.role);
    return rolePermissions.includes(permission);
  }, [authState.user]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const authValue = useMemo<UseAuthReturn>(() => ({
    user: authState.user,
    isAuthenticated: authState.isAuthenticated,
    isLoading: authState.isLoading,
    error: authState.error,
    login: async (credentials: LoginCredentials) => {
      await loginMutation.mutateAsync(credentials);
    },
    register: async (data: RegisterData) => {
      await registerMutation.mutateAsync(data);
    },
    logout: async () => {
      await logoutMutation.mutateAsync();
    },
    resetPassword: async (email: string) => {
      await passwordResetMutation.mutateAsync(email);
    },
    confirmPasswordReset: async (token: string, newPassword: string) => {
      await passwordResetConfirmMutation.mutateAsync({ token, newPassword });
    },
    oauthLogin: async (provider: OAuthProvider) => {
      await oauthMutation.mutateAsync(provider);
    },
    updateProfile: async (data: Partial<UserProfile>) => {
      await profileUpdateMutation.mutateAsync(data);
    },
    hasRole,
    hasPermission,
    clearError
  }), [
    authState.user,
    authState.isAuthenticated,
    authState.isLoading,
    authState.error,
    loginMutation,
    registerMutation,
    logoutMutation,
    passwordResetMutation,
    passwordResetConfirmMutation,
    oauthMutation,
    profileUpdateMutation,
    hasRole,
    hasPermission,
    clearError
  ]);

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): UseAuthReturn => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const useProtectedRoute = (requiredRole?: UserRole) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate('/login', { replace: true });
      return;
    }

    if (requiredRole && user?.role !== requiredRole) {
      navigate('/unauthorized', { replace: true });
      return;
    }
  }, [isAuthenticated, isLoading, user, requiredRole, navigate]);

  return { user, isAuthenticated, isLoading };
};

import { getRedirectPath, getRolePermissions } from './authUtils';
