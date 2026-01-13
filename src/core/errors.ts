/**
 * Core Error Classes
 * Custom error classes for core module operations
 */
export class CoreError extends Error {
    constructor(
        message: string,
        public code: string,
        public details?: unknown
    ) {
        super(message);
        this.name = 'CoreError';
    }
}

export class ModuleInitializationError extends CoreError {
    constructor(moduleName: string, details?: unknown) {
        super(
            `Failed to initialize module: ${moduleName}`,
            'MODULE_INIT_ERROR',
            details
        );
        this.name = 'ModuleInitializationError';
    }
}

export class ValidationError extends CoreError {
    constructor(message: string, details?: unknown) {
        super(message, 'VALIDATION_ERROR', details);
        this.name = 'ValidationError';
    }
}

export class AuthenticationError extends CoreError {
    constructor(message: string = 'Authentication failed', details?: unknown) {
        super(message, 'AUTH_ERROR', details);
        this.name = 'AuthenticationError';
    }
}

export class AuthorizationError extends CoreError {
    constructor(message: string = 'Access denied', details?: unknown) {
        super(message, 'AUTHORIZATION_ERROR', details);
        this.name = 'AuthorizationError';
    }
}
