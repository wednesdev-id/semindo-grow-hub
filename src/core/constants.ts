/**
 * Core Constants
 * Global constants used across core modules
 */
export const CORE_CONSTANTS = {
    // API Constants
    API_VERSION: 'v1',
    API_TIMEOUT: 30000, // 30 seconds
    MAX_RETRIES: 3,

    // Auth Constants
    TOKEN_KEY: 'semindo_access_token',
    REFRESH_TOKEN_KEY: 'semindo_refresh_token',
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes

    // Storage Constants
    STORAGE_PREFIX: 'semindo_',
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'],

    // Validation Constants
    MIN_PASSWORD_LENGTH: 8,
    MAX_PASSWORD_LENGTH: 128,
    MIN_PHONE_LENGTH: 10,
    MAX_PHONE_LENGTH: 15,

    // Business Constants
    BUSINESS_LEVELS: {
        MICRO: { minRevenue: 0, maxRevenue: 300000000, minEmployees: 0, maxEmployees: 4 },
        SMALL: { minRevenue: 300000000, maxRevenue: 2500000000, minEmployees: 5, maxEmployees: 19 },
        MEDIUM: { minRevenue: 2500000000, maxRevenue: 50000000000, minEmployees: 20, maxEmployees: 99 }
    },

    // Feature Flags
    FEATURES: {
        ASSESSMENT: true,
        LEARNING: true,
        CONSULTATION: true,
        FINANCING: true,
        MARKETPLACE: true,
        EXPORT: true,
        COMMUNITY: true,
        MONITORING: true,
        ANALYTICS: true
    }
} as const;
