/**
 * Core Modules Index
 * Centralized export for all core business logic modules
 * This file serves as the main entry point for all core functionality
 */

// Core Definitions
export * from './constants';
export * from './errors';

// Auth Module
export * from './auth/types';
export * from './auth/services/AuthService';
export * from './auth/hooks/useAuth';

// Assessment Module
export * from './assessment/types';
export * from './assessment/services/AssessmentEngine';

// Infrastructure exports
export * from './infrastructure/api/ApiClient';
export * from './infrastructure/storage/StorageService';

/**
 * Core Module Interfaces
 * Define the contract for each core module
 */
export interface ICoreModule {
  name: string;
  version: string;
  initialize(): Promise<void>;
  destroy?(): Promise<void>;
}

/**
 * Core Module Registry
 * Centralized registry for all core modules
 */
export class CoreModuleRegistry {
  private modules: Map<string, ICoreModule> = new Map();

  register(module: ICoreModule): void {
    this.modules.set(module.name, module);
  }

  get(name: string): ICoreModule | undefined {
    return this.modules.get(name);
  }

  async initializeAll(): Promise<void> {
    const initializationPromises = Array.from(this.modules.values()).map(module =>
      module.initialize()
    );

    try {
      await Promise.all(initializationPromises);
      console.log('All core modules initialized successfully');
    } catch (error) {
      console.error('Failed to initialize core modules:', error);
      throw error;
    }
  }

  async destroyAll(): Promise<void> {
    const destructionPromises = Array.from(this.modules.values())
      .filter(module => module.destroy)
      .map(module => module.destroy!());

    try {
      await Promise.all(destructionPromises);
      console.log('All core modules destroyed successfully');
    } catch (error) {
      console.error('Failed to destroy core modules:', error);
      throw error;
    }
  }

  list(): string[] {
    return Array.from(this.modules.keys());
  }
}

/**
 * Core Application Class
 * Main application class that manages all core modules
 */
export class CoreApplication {
  private static instance: CoreApplication;
  private moduleRegistry: CoreModuleRegistry;
  private isInitialized: boolean = false;

  private constructor() {
    this.moduleRegistry = new CoreModuleRegistry();
  }

  static getInstance(): CoreApplication {
    if (!CoreApplication.instance) {
      CoreApplication.instance = new CoreApplication();
    }
    return CoreApplication.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('Core application already initialized');
      return;
    }

    try {
      // Register all core modules
      await this.registerModules();

      // Initialize all modules
      await this.moduleRegistry.initializeAll();

      this.isInitialized = true;
      console.log('Core application initialized successfully');
    } catch (error) {
      console.error('Failed to initialize core application:', error);
      throw error;
    }
  }

  async destroy(): Promise<void> {
    if (!this.isInitialized) {
      console.warn('Core application not initialized');
      return;
    }

    try {
      // Destroy all modules
      await this.moduleRegistry.destroyAll();
      this.isInitialized = false;
      console.log('Core application destroyed successfully');
    } catch (error) {
      console.error('Failed to destroy core application:', error);
      throw error;
    }
  }

  private async registerModules(): Promise<void> {
    // This method will be implemented to register all core modules
    // For now, it's a placeholder
    console.log('Registering core modules...');
  }

  getModuleRegistry(): CoreModuleRegistry {
    return this.moduleRegistry;
  }

  getModule(name: string): ICoreModule | undefined {
    return this.moduleRegistry.get(name);
  }

  isReady(): boolean {
    return this.isInitialized;
  }
}

/**
 * Core Configuration
 * Global configuration for all core modules
 */
export interface CoreConfig {
  environment: 'development' | 'staging' | 'production';
  api: {
    baseUrl: string;
    timeout: number;
    retries: number;
  };
  auth: {
    tokenKey: string;
    refreshTokenKey: string;
    sessionTimeout: number;
  };
  storage: {
    prefix: string;
    encryptionKey?: string;
  };
  features: {
    [key: string]: boolean;
  };
}

/**
 * Core Utilities
 * Helper functions for core module operations
 */
export const CoreUtils = {
  /**
   * Debounce function calls
   */
  debounce<T extends (...args: unknown[]) => unknown>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  },

  /**
   * Throttle function calls
   */
  throttle<T extends (...args: unknown[]) => unknown>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  },

  /**
   * Deep clone an object
   */
  deepClone<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as unknown as T;
    if (Array.isArray(obj)) return obj.map(item => this.deepClone(item)) as unknown as T;

    const cloned: Record<string, unknown> = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj as object, key)) {
        cloned[key] = this.deepClone((obj as Record<string, unknown>)[key]);
      }
    }
    return cloned as unknown as T;
  },

  /**
   * Generate unique ID
   */
  generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  /**
   * Format file size
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },

  /**
   * Validate email format
   */
  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  /**
   * Validate phone number format (Indonesian)
   */
  isValidPhoneNumber(phone: string): boolean {
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },

  /**
   * Sanitize HTML content
   */
  sanitizeHtml(html: string): string {
    const div = document.createElement('div');
    div.textContent = html;
    return div.innerHTML;
  }
};
