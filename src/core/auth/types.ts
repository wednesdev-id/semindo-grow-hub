/**
 * Auth Module - Type Definitions
 * Core authentication and user management types
 */

// User Roles
// User Roles
export type UserRole = 'umkm' | 'consultant' | 'konsultan' | 'admin' | 'partner' | 'bank';
export type UserStatus = 'active' | 'inactive' | 'pending' | 'suspended';
export type BusinessCategory = 'kuliner' | 'fashion' | 'agribisnis' | 'kerajinan' | 'jasa' | 'manufaktur' | 'lainnya';
export type BusinessLevel = 'micro' | 'small' | 'medium';

// Base User Interface
export interface User {
  id: string;
  email: string;
  fullName: string; // Added
  phone?: string; // Added
  role: UserRole;
  roles: string[]; // Added
  permissions: string[]; // Added
  status: UserStatus;
  profile: UserProfile;
  businessProfile?: BusinessProfile;
  umkmProfile?: any; // Added
  mentorProfile?: any; // Added
  consultantProfile?: any; // Added
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt?: Date;
}

// User Profile
export interface UserProfile {
  fullName: string;
  phoneNumber: string;
  avatar?: string;
  address?: Address;
  preferences: UserPreferences;
}

// Business Profile for UMKM users
export interface BusinessProfile {
  businessName: string;
  businessCategory: BusinessCategory;
  businessLevel?: BusinessLevel;
  businessAddress: Address;
  npwp?: string;
  nib?: string;
  establishedYear?: number;
  employeeCount?: number;
  annualRevenue?: number;
  description?: string;
  website?: string;
  socialMedia?: SocialMediaLinks;
}

// Address Interface
export interface Address {
  street: string;
  city: string;
  district: string;
  province: string;
  postalCode: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

// Social Media Links
export interface SocialMediaLinks {
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  whatsapp?: string;
}

// User Preferences
export interface UserPreferences {
  language: 'id' | 'en';
  notifications: NotificationPreferences;
  privacy: PrivacySettings;
}

// Notification Preferences
export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  categories: {
    assessment: boolean;
    learning: boolean;
    consultation: boolean;
    financing: boolean;
    community: boolean;
  };
}

// Privacy Settings
export interface PrivacySettings {
  profileVisible: boolean;
  businessVisible: boolean;
  showEmail: boolean;
  showPhone: boolean;
}

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  role: UserRole;
  businessName?: string;
  businessCategory?: BusinessCategory;
  referralCode?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  permissions: string[];
  iat: number;
  exp: number;
}

// Password Reset
export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  newPassword: string;
}

// OAuth Types
export interface OAuthProvider {
  provider: 'google' | 'facebook';
  accessToken: string;
}

export interface OAuthResponse {
  user: User;
  isNewUser: boolean;
  token: string;
}

// Export ApiClient types by re-exporting them
import { ApiError, ApiResponse, ValidationError } from '../infrastructure/api/ApiClient';
export type { ApiError, ApiResponse, ValidationError };
import { DeviceInfo } from '../assessment/types';

// Validation Types
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Session Management
export interface SessionInfo {
  userId: string;
  loginTime: Date;
  lastActivity: Date;
  ipAddress: string;
  userAgent: string;
  deviceInfo?: DeviceInfo;
}

// Audit Log Types
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  metadata?: Record<string, unknown>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

// Local Storage Audit Log (with serializable timestamp)
export interface LocalAuditLog extends Omit<AuditLog, 'timestamp'> {
  timestamp: string;
  synced: boolean;
}

// Permission and Role Types
export interface RolePermission {
  role: UserRole;
  permissions: Permission[];
}

export type Permission =
  | 'read:profile'
  | 'update:profile'
  | 'read:business'
  | 'update:business'
  | 'take:assessment'
  | 'read:assessment'
  | 'enroll:course'
  | 'complete:course'
  | 'book:consultation'
  | 'read:consultation'
  | 'apply:financing'
  | 'read:financing'
  | 'create:product'
  | 'update:product'
  | 'delete:product'
  | 'read:marketplace'
  | 'create:forum'
  | 'read:forum'
  | 'moderate:forum'
  | 'admin:*';

// Rate Limiting
export interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
  keyGenerator: (request: unknown) => string;
}

// Security Types
export interface SecurityConfig {
  passwordPolicy: {
    minLength: number;
    requireUppercase: boolean;
    requireLowercase: boolean;
    requireNumbers: boolean;
    requireSpecialChars: boolean;
  };
  sessionTimeout: number;
  maxLoginAttempts: number;
  lockoutDuration: number;
  twoFactorEnabled: boolean;
}
