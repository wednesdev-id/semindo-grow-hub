/**
 * Feature Flags Configuration (Frontend)
 * 
 * Control which features are enabled/disabled via environment variables.
 * These are read at build time from VITE_* env vars.
 */

export const featureFlags = {
    // Core Modules
    UMKM_DATABASE_ENABLED: import.meta.env.VITE_FEATURE_UMKM_DATABASE !== 'false', // default enabled
    MENTOR_MANAGEMENT_ENABLED: import.meta.env.VITE_FEATURE_MENTOR_MANAGEMENT !== 'false', // default enabled
    PROGRAM_MANAGEMENT_ENABLED: import.meta.env.VITE_FEATURE_PROGRAM_MANAGEMENT !== 'false', // default enabled
    LMS_ENABLED: import.meta.env.VITE_FEATURE_LMS !== 'false', // default enabled
    CONSULTATION_ENABLED: import.meta.env.VITE_FEATURE_CONSULTATION !== 'false', // default enabled

    // Optional Modules
    MARKETPLACE_ENABLED: import.meta.env.VITE_FEATURE_MARKETPLACE === 'true', // default disabled
    COMMUNITY_ENABLED: import.meta.env.VITE_FEATURE_COMMUNITY !== 'false', // default enabled
    EXPORT_HUB_ENABLED: import.meta.env.VITE_FEATURE_EXPORT_HUB !== 'false', // default enabled
    FINANCING_ENABLED: import.meta.env.VITE_FEATURE_FINANCING !== 'false', // default enabled
    EVENT_MANAGEMENT_ENABLED: import.meta.env.VITE_EVENT_MANAGEMENT !== 'false', // default enabled
};

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof featureFlags): boolean {
    return featureFlags[feature];
}
