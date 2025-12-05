/**
 * Main Application Setup
 * Integrates all core modules and provides application-level services
 */

import { ApiClientFactory, ApiError } from './infrastructure/api/ApiClient';
import { AuthService } from './auth/services/AuthService'
import { TokenService } from './auth/services/TokenService'
import { AuthValidationService } from './auth/services/AuthValidationService'
import { AuditService } from './auth/services/AuditService'
import { AssessmentEngine } from './assessment/services/AssessmentEngine'
import { AssessmentService } from './assessment/services/AssessmentService'

import { CORE_CONSTANTS, CoreApplication, CoreConfig, CoreError } from '.'

/**
 * Application Configuration
 */
const appConfig: CoreConfig = {
  environment: (import.meta.env.VITE_ENVIRONMENT as 'development' | 'staging' | 'production') || 'development',
  api: {
    baseUrl: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
    timeout: 30000,
    retries: 3
  },
  auth: {
    tokenKey: CORE_CONSTANTS.TOKEN_KEY,
    refreshTokenKey: CORE_CONSTANTS.REFRESH_TOKEN_KEY,
    sessionTimeout: CORE_CONSTANTS.SESSION_TIMEOUT
  },
  storage: {
    prefix: CORE_CONSTANTS.STORAGE_PREFIX,
    encryptionKey: import.meta.env.VITE_ENCRYPTION_KEY
  },
  features: {
    assessment: true,
    analytics: true
  }
};

/**
 * Service Container
 * Centralized container for all application services
 */
export class ServiceContainer {
  private static instance: ServiceContainer;
  private services: Map<string, unknown> = new Map();
  private isInitialized: boolean = false;

  private constructor() { }

  static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  /**
   * Initialize all services
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('Service container already initialized');
      return;
    }

    try {
      // Initialize infrastructure services
      await this.initializeInfrastructureServices();

      // Initialize core business services
      await this.initializeCoreServices();

      // Initialize feature services
      await this.initializeFeatureServices();

      this.isInitialized = true;
      console.log('Service container initialized successfully');
    } catch (error) {
      console.error('Failed to initialize service container:', error);
      throw new CoreError('Service initialization failed', 'INIT_ERROR', error);
    }
  }

  /**
   * Initialize infrastructure services
   */
  private async initializeInfrastructureServices(): Promise<void> {
    // API Client
    const apiClient = ApiClientFactory.createClient({
      environment: appConfig.environment,
      tokenProvider: () => this.getToken(),
      onError: (error) => this.handleApiError(error),
      onUnauthorized: () => this.handleUnauthorized()
    });

    this.services.set('apiClient', apiClient);

    // Storage Service
    const storageService = new StorageService({
      prefix: appConfig.storage.prefix,
      encryptionKey: appConfig.storage.encryptionKey
    });

    this.services.set('storageService', storageService);

    // Token Service
    // Use a dedicated storage service for tokens to match legacy AuthContext which uses 'auth_token' without prefix
    const tokenStorageService = new StorageService({ prefix: '', storage: sessionStorage });

    const tokenService = new TokenService({
      tokenKey: 'auth_token',
      refreshTokenKey: appConfig.auth.refreshTokenKey,
      storageService: tokenStorageService
    });

    this.services.set('tokenService', tokenService);
  }

  /**
   * Initialize core business services
   */
  private async initializeCoreServices(): Promise<void> {
    const apiClient = this.getService<ApiClient>('apiClient');
    const storageService = new StorageService({
      prefix: appConfig.storage.prefix,
      encryptionKey: appConfig.storage.encryptionKey
    });
    this.services.set('storageService', storageService); // Ensure storageService is set here if not in infrastructure

    // Use a dedicated storage service for tokens to match legacy AuthContext which uses 'auth_token' without prefix
    const tokenStorageService = new StorageService({ prefix: '', storage: sessionStorage });
    const tokenService = new TokenService({
      tokenKey: 'auth_token', // Hardcoded as per instruction
      refreshTokenKey: appConfig.auth.refreshTokenKey,
      storageService: tokenStorageService
    });
    this.services.set('tokenService', tokenService);

    // Auth Validation Service
    const authValidationService = new AuthValidationService();
    this.services.set('authValidationService', authValidationService);

    // Audit Service
    const auditService = new AuditService({
      apiClient,
      storageService
    });

    this.services.set('auditService', auditService);

    // Auth Service
    const authService = new AuthService(
      apiClient,
      authValidationService,
      tokenService,
      auditService
    );

    this.services.set('authService', authService);

    // Assessment Engine
    const assessmentEngine = new AssessmentEngine();
    this.services.set('assessmentEngine', assessmentEngine);

    // Assessment Service
    const assessmentService = new AssessmentService({
      apiClient,
      assessmentEngine,
      storageService
    });

    this.services.set('assessmentService', assessmentService);
  }

  /**
   * Initialize feature services
   */
  private async initializeFeatureServices(): Promise<void> { }

  /**
   * Get service by name
   */
  getService<T = unknown>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      throw new CoreError(`Service not found: ${name}`, 'SERVICE_NOT_FOUND');
    }
    return service as T;
  }

  /**
   * Check if service exists
   */
  hasService(name: string): boolean {
    return this.services.has(name);
  }

  /**
   * Get token from token service
   */
  private async getToken(): Promise<string | null> {
    try {
      const tokenService = this.getService<TokenService>('tokenService');
      return await tokenService.getAccessToken();
    } catch (error) {
      console.error('Failed to get token:', error);
      return null;
    }
  }

  /**
   * Handle API errors
   */
  private handleApiError(error: ApiError): void {
    console.error('API Error:', error);
  }

  /**
   * Handle unauthorized responses
   */
  private handleUnauthorized(): void {
    console.warn('Unauthorized access detected');

    try {
      const tokenService = this.getService<TokenService>('tokenService');
      tokenService.clearTokens();
    } catch (error) {
      console.error('Failed to clear tokens:', error);
    }
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
  }

  /**
   * Get all available services
   */
  getAvailableServices(): string[] {
    return Array.from(this.services.keys());
  }

  /**
   * Check if container is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }
}

import { StorageService } from './infrastructure/storage/StorageService'

/**
 * Feature Services (Placeholders)
 * These will be implemented with actual business logic
 */
type PlaceholderConfig = Record<string, unknown>
class LearningService { constructor(config: PlaceholderConfig) { } }
class ConsultationService { constructor(config: PlaceholderConfig) { } }
class FinancingService { constructor(config: PlaceholderConfig) { } }
class MarketplaceService { constructor(config: PlaceholderConfig) { } }
class ExportService { constructor(config: PlaceholderConfig) { } }
class CommunityService { constructor(config: PlaceholderConfig) { } }
class MonitoringService {
  constructor(config: PlaceholderConfig) { }
  logError(error: unknown): void {
    console.error('Monitoring error:', error);
  }
}

/**
 * Global Service Container Instance
 */
let globalServiceContainer: ServiceContainer | null = null;

export const initializeServices = async (): Promise<ServiceContainer> => {
  if (globalServiceContainer) {
    return globalServiceContainer;
  }

  globalServiceContainer = ServiceContainer.getInstance();
  await globalServiceContainer.initialize();

  return globalServiceContainer;
};

export const getServices = (): ServiceContainer => {
  if (!globalServiceContainer) {
    throw new Error('Services not initialized. Call initializeServices() first.');
  }
  return globalServiceContainer;
};

/**
 * Application Bootstrap
 * Main entry point for application initialization
 */
export const bootstrapApplication = async (): Promise<void> => {
  try {
    console.log('🚀 Initializing Semindo Core Application...');

    // Initialize services
    const services = await initializeServices();

    // Initialize core application
    const coreApp = CoreApplication.getInstance();
    await coreApp.initialize();

    // Set global API client
    const apiClient = services.getService<ApiClient>('apiClient');
    setGlobalApiClient(apiClient);

    console.log('✅ Semindo Core Application initialized successfully');

    // Dispatch initialization event
    window.dispatchEvent(new CustomEvent('app:initialized'));

  } catch (error) {
    console.error('❌ Failed to bootstrap application:', error);

    // Dispatch error event
    window.dispatchEvent(new CustomEvent('app:init_error', { detail: error }));

    throw error;
  }
};

/**
 * Import setGlobalApiClient from ApiClient module
 */
import { setGlobalApiClient, ApiClient } from './infrastructure/api/ApiClient';
