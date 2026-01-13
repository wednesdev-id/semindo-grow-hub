/**
 * Auth Service - Business Logic for Authentication
 * Handles user authentication, registration, and session management
 */

import {
  User,
  LoginCredentials,
  RegisterData,
  AuthResponse,
  PasswordResetRequest,
  PasswordResetConfirm,
  OAuthProvider,
  OAuthResponse,
  ApiResponse,
  ValidationResult,
  SessionInfo,
  AuditLog,
  UserRole,
  UserStatus,
  BusinessProfile,
  UserProfile,
  TokenPayload
} from '../types';

import { AuthValidationService } from './AuthValidationService';
import { TokenService } from './TokenService';
import { AuditService } from './AuditService';
import { ApiClient } from '../../infrastructure/api/ApiClient';

export class AuthService {
  private apiClient: ApiClient;
  private validationService: AuthValidationService;
  private tokenService: TokenService;
  private auditService: AuditService;

  constructor(
    apiClient: ApiClient,
    validationService: AuthValidationService,
    tokenService: TokenService,
    auditService: AuditService
  ) {
    this.apiClient = apiClient;
    this.validationService = validationService;
    this.tokenService = tokenService;
    this.auditService = auditService;
  }

  /**
   * Authenticate user with email and password
   */
  async login(credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> {
    try {
      // Validate input
      const validation = this.validationService.validateLogin(credentials);
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid login credentials',
            details: validation.errors
          }
        };
      }

      // Attempt login
      const response = await this.apiClient.post('/auth/login', credentials);
      
      if (response.success) {
        // Store tokens
        await this.tokenService.storeTokens({
          accessToken: response.data.token,
          refreshToken: response.data.refreshToken,
          expiresIn: response.data.expiresIn
        });

        // Log audit event
        await this.auditService.log({
          userId: response.data.user.id,
          action: 'USER_LOGIN',
          resource: 'auth',
          metadata: {
            method: 'email_password',
            rememberMe: credentials.rememberMe
          },
          ipAddress: this.getClientIp(),
          userAgent: this.getUserAgent()
        });

        return {
          success: true,
          data: response.data,
          message: 'Login successful'
        };
      }

      return response;
    } catch (error) {
      return this.handleError(error, 'Login failed');
    }
  }

  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<ApiResponse<AuthResponse>> {
    try {
      // Validate input
      const validation = this.validationService.validateRegistration(data);
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid registration data',
            details: validation.errors
          }
        };
      }

      // Check if user already exists
      const existingUser = await this.checkUserExists(data.email);
      if (existingUser) {
        return {
          success: false,
          error: {
            code: 'USER_EXISTS',
            message: 'User with this email already exists'
          }
        };
      }

      // Create user
      const response = await this.apiClient.post('/auth/register', data);
      
      if (response.success) {
        // Store tokens
        await this.tokenService.storeTokens({
          accessToken: response.data.token,
          refreshToken: response.data.refreshToken,
          expiresIn: response.data.expiresIn
        });

        // Log audit event
        await this.auditService.log({
          userId: response.data.user.id,
          action: 'USER_REGISTERED',
          resource: 'auth',
          metadata: {
            role: data.role,
            businessCategory: data.businessCategory
          },
          ipAddress: this.getClientIp(),
          userAgent: this.getUserAgent()
        });

        return {
          success: true,
          data: response.data,
          message: 'Registration successful'
        };
      }

      return response;
    } catch (error) {
      return this.handleError(error, 'Registration failed');
    }
  }

  /**
   * Logout user and clear session
   */
  async logout(): Promise<ApiResponse<void>> {
    try {
      const currentUser = await this.getCurrentUser();
      
      // Call logout API
      await this.apiClient.post('/auth/logout');
      
      // Clear local storage
      await this.tokenService.clearTokens();

      // Log audit event
      if (currentUser) {
        await this.auditService.log({
          userId: currentUser.id,
          action: 'USER_LOGOUT',
          resource: 'auth',
          ipAddress: this.getClientIp(),
          userAgent: this.getUserAgent()
        });
      }

      return {
        success: true,
        message: 'Logout successful'
      };
    } catch (error) {
      return this.handleError(error, 'Logout failed');
    }
  }

  /**
   * Refresh authentication token
   */
  async refreshToken(): Promise<ApiResponse<string>> {
    try {
      const refreshToken = await this.tokenService.getRefreshToken();
      if (!refreshToken) {
        return {
          success: false,
          error: {
            code: 'NO_REFRESH_TOKEN',
            message: 'No refresh token available'
          }
        };
      }

      const response = await this.apiClient.post('/auth/refresh', { refreshToken });
      
      if (response.success) {
        // Update stored tokens
        await this.tokenService.storeTokens({
          accessToken: response.data.token,
          refreshToken: response.data.refreshToken,
          expiresIn: response.data.expiresIn
        });

        return {
          success: true,
          data: response.data.token,
          message: 'Token refreshed successfully'
        };
      }

      return response;
    } catch (error) {
      return this.handleError(error, 'Token refresh failed');
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(data: PasswordResetRequest): Promise<ApiResponse<void>> {
    try {
      const validation = this.validationService.validateEmail(data.email);
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid email address',
            details: validation.errors
          }
        };
      }

      const response = await this.apiClient.post('/auth/password-reset', data);
      
      // Log audit event (without user ID since user is not authenticated)
      await this.auditService.log({
        action: 'PASSWORD_RESET_REQUESTED',
        resource: 'auth',
        metadata: { email: data.email },
        ipAddress: this.getClientIp(),
        userAgent: this.getUserAgent()
      });

      return response;
    } catch (error) {
      return this.handleError(error, 'Password reset request failed');
    }
  }

  /**
   * Confirm password reset
   */
  async confirmPasswordReset(data: PasswordResetConfirm): Promise<ApiResponse<void>> {
    try {
      const validation = this.validationService.validatePassword(data.newPassword);
      if (!validation.isValid) {
        return {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid password',
            details: validation.errors
          }
        };
      }

      const response = await this.apiClient.post('/auth/password-reset/confirm', data);
      
      if (response.success) {
        // Log audit event
        await this.auditService.log({
          action: 'PASSWORD_RESET_CONFIRMED',
          resource: 'auth',
          metadata: { token: data.token },
          ipAddress: this.getClientIp(),
          userAgent: this.getUserAgent()
        });
      }

      return response;
    } catch (error) {
      return this.handleError(error, 'Password reset confirmation failed');
    }
  }

  /**
   * OAuth authentication
   */
  async oauthLogin(provider: OAuthProvider): Promise<ApiResponse<OAuthResponse>> {
    try {
      const response = await this.apiClient.post(`/auth/oauth/${provider.provider}`, {
        accessToken: provider.accessToken
      });

      if (response.success) {
        // Store tokens
        await this.tokenService.storeTokens({
          accessToken: response.data.token,
          refreshToken: response.data.refreshToken,
          expiresIn: response.data.expiresIn
        });

        // Log audit event
        await this.auditService.log({
          userId: response.data.user.id,
          action: 'OAUTH_LOGIN',
          resource: 'auth',
          metadata: { provider: provider.provider, isNewUser: response.data.isNewUser },
          ipAddress: this.getClientIp(),
          userAgent: this.getUserAgent()
        });
      }

      return response;
    } catch (error) {
      return this.handleError(error, 'OAuth login failed');
    }
  }

  /**
   * Get current authenticated user
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const token = await this.tokenService.getAccessToken();
      if (!token) {
        return null;
      }

      const response = await this.apiClient.get('/auth/me');
      return response.success ? response.data : null;
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateProfile(userId: string, data: Partial<UserProfile>): Promise<ApiResponse<User>> {
    try {
      const response = await this.apiClient.put(`/users/${userId}/profile`, data);
      
      if (response.success) {
        await this.auditService.log({
          userId,
          action: 'PROFILE_UPDATED',
          resource: 'user',
          metadata: { updatedFields: Object.keys(data) },
          ipAddress: this.getClientIp(),
          userAgent: this.getUserAgent()
        });
      }

      return response;
    } catch (error) {
      return this.handleError(error, 'Profile update failed');
    }
  }

  /**
   * Update business profile
   */
  async updateBusinessProfile(userId: string, data: Partial<BusinessProfile>): Promise<ApiResponse<User>> {
    try {
      const response = await this.apiClient.put(`/users/${userId}/business-profile`, data);
      
      if (response.success) {
        await this.auditService.log({
          userId,
          action: 'BUSINESS_PROFILE_UPDATED',
          resource: 'user',
          metadata: { updatedFields: Object.keys(data) },
          ipAddress: this.getClientIp(),
          userAgent: this.getUserAgent()
        });
      }

      return response;
    } catch (error) {
      return this.handleError(error, 'Business profile update failed');
    }
  }

  /**
   * Check if user exists by email
   */
  private async checkUserExists(email: string): Promise<boolean> {
    try {
      const response = await this.apiClient.get<{ exists: boolean }>(`/users/check-email?email=${encodeURIComponent(email)}`);
      return response.success && !!response.data && response.data.exists === true;
    } catch (error) {
      console.error('Failed to check user existence:', error);
      return false;
    }
  }

  /**
   * Get client IP address
   */
  private getClientIp(): string {
    // This will be implemented based on the actual environment
    // For now, return a placeholder
    return '0.0.0.0';
  }

  /**
   * Get user agent string
   */
  private getUserAgent(): string {
    if (typeof window !== 'undefined') {
      return window.navigator.userAgent;
    }
    return 'Unknown';
  }

  /**
   * Handle errors consistently
   */
  private handleError(error: unknown, defaultMessage: string): ApiResponse<never> {
    console.error(`${defaultMessage}:`, error);
    
    return {
      success: false,
      error: {
        code: (error as { code?: string }).code || 'INTERNAL_ERROR',
        message: (error as { message?: string }).message || defaultMessage,
        details: error
      }
    };
  }
}
