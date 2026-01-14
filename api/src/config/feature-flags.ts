/**
 * Feature Flags Configuration
 * 
 * Control which features are enabled/disabled via environment variables.
 * This allows toggling features without code changes.
 */

export const featureFlags = {
    // Core Modules
    UMKM_DATABASE_ENABLED: process.env.FEATURE_UMKM_DATABASE !== 'false', // default enabled
    MENTOR_MANAGEMENT_ENABLED: process.env.FEATURE_MENTOR_MANAGEMENT !== 'false', // default enabled
    PROGRAM_MANAGEMENT_ENABLED: process.env.FEATURE_PROGRAM_MANAGEMENT !== 'false', // default enabled
    LMS_ENABLED: process.env.FEATURE_LMS !== 'false', // default enabled
    CONSULTATION_ENABLED: process.env.FEATURE_CONSULTATION !== 'false', // default enabled

    // Optional Modules
    MARKETPLACE_ENABLED: process.env.FEATURE_MARKETPLACE === 'true', // default disabled
    COMMUNITY_ENABLED: process.env.FEATURE_COMMUNITY !== 'false', // default enabled
    EXPORT_HUB_ENABLED: process.env.FEATURE_EXPORT_HUB !== 'false', // default enabled
    FINANCING_ENABLED: process.env.FEATURE_FINANCING !== 'false', // default enabled
};

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(feature: keyof typeof featureFlags): boolean {
    return featureFlags[feature];
}

/**
 * Middleware to block requests to disabled features
 */
export function requireFeature(feature: keyof typeof featureFlags) {
    return (req: any, res: any, next: any) => {
        if (!featureFlags[feature]) {
            return res.status(404).json({
                success: false,
                message: 'This feature is currently unavailable',
            });
        }
        next();
    };
}
