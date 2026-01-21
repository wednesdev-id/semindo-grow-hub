"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = createServer;
const express_1 = __importDefault(require("express"));
const compression_1 = __importDefault(require("compression"));
const rateLimit_middleware_1 = require("./systems/middlewares/rateLimit.middleware");
const health_1 = require("./systems/health");
const assessment_1 = require("./systems/assessment");
const auth_1 = require("./systems/auth");
const users_1 = require("./systems/users");
const profile_1 = require("./systems/profile");
const security_1 = require("./systems/middlewares/security");
const audit_1 = require("./systems/middlewares/audit");
const cors_1 = require("./systems/middlewares/cors");
const lms_1 = require("./systems/lms");
const dashboard_1 = require("./systems/dashboard");
const marketplace_1 = require("./systems/marketplace");
const store_routes_1 = require("./systems/marketplace/routes/store.routes");
const upload_routes_1 = require("./systems/marketplace/routes/upload.routes");
const cart_routes_1 = require("./systems/marketplace/routes/cart.routes");
const financing_1 = require("./systems/financing");
const export_1 = require("./systems/export");
const community_1 = require("./systems/community");
const program_1 = require("./systems/program");
const umkm_1 = require("./systems/umkm");
const roles_routes_1 = require("./systems/roles/routes/roles.routes");
const permissions_routes_1 = require("./systems/permissions/routes/permissions.routes");
const audit_routes_1 = require("./systems/audit/routes/audit.routes");
const consultation_routes_1 = __importDefault(require("./systems/consultation/routes/consultation.routes"));
const onboarding_1 = require("./systems/onboarding");
const cron_service_1 = require("./systems/scheduler/cron.service");
const feature_flags_1 = require("./config/feature-flags");
function createServer() {
    const app = (0, express_1.default)();
    // Log feature flags status
    console.log('[API] Feature Flags:', feature_flags_1.featureFlags);
    app.disable('x-powered-by');
    // Global Middleware
    app.use((0, compression_1.default)());
    app.use(rateLimit_middleware_1.apiLimiter);
    app.use(express_1.default.json({ limit: '1mb' }));
    app.use(cors_1.corsMiddleware);
    app.use(security_1.securityMiddleware);
    app.use(audit_1.auditMiddleware);
    app.use((req, res, next) => {
        const start = Date.now();
        console.log(`[API] Incoming ${req.method} ${req.path}`);
        res.on('finish', () => {
            const duration = Date.now() - start;
            console.log(`[API] Completed ${req.method} ${req.path} ${res.statusCode} [${duration}ms]`);
        });
        next();
    });
    // Core routes (always enabled)
    app.use('/healthz', health_1.healthRouter);
    app.use('/api/v1/auth', auth_1.authRouter);
    app.use('/api/v1/users', users_1.usersRouter); // Includes distribution map
    app.use('/api/v1/profile', profile_1.profileRouter);
    app.use('/api/v1/assessment', assessment_1.assessmentRouter);
    app.use('/api/v1/lms', lms_1.lmsRouter);
    app.use('/api/v1/dashboard', dashboard_1.dashboardRouter);
    app.use('/api/v1/documents', profile_1.documentRouter);
    app.use('/api/v1/programs', program_1.programRouter);
    app.use('/api/v1/umkm', umkm_1.umkmRouter);
    app.use('/api/v1/roles', roles_routes_1.rolesRouter);
    app.use('/api/v1/permissions', permissions_routes_1.permissionsRouter);
    app.use('/api/v1/audit-logs', audit_routes_1.auditRouter);
    app.use('/api/v1/consultation', consultation_routes_1.default);
    app.use('/api/v1/onboarding', onboarding_1.onboardingRouter); // Public registration
    // Feature-flagged routes
    if (feature_flags_1.featureFlags.MARKETPLACE_ENABLED) {
        console.log('[API] Marketplace feature ENABLED');
        app.use('/api/v1/marketplace', marketplace_1.marketplaceRouter);
        app.use('/api/v1/marketplace', store_routes_1.storeRouter);
        app.use('/api/v1/marketplace', upload_routes_1.uploadRouter);
        app.use('/api/v1/marketplace', cart_routes_1.cartRouter);
    }
    else {
        // Return 404 for disabled marketplace routes
        app.use('/api/v1/marketplace', (0, feature_flags_1.requireFeature)('MARKETPLACE_ENABLED'));
    }
    if (feature_flags_1.featureFlags.FINANCING_ENABLED) {
        app.use('/api/v1/financing', financing_1.financingRouter);
    }
    if (feature_flags_1.featureFlags.EXPORT_HUB_ENABLED) {
        app.use('/api/v1/export', export_1.exportRouter);
    }
    if (feature_flags_1.featureFlags.COMMUNITY_ENABLED) {
        app.use('/api/v1/community', community_1.communityRouter);
    }
    // Serve uploaded files
    app.use('/uploads', express_1.default.static('uploads'));
    // Initialize background jobs
    const cronService = cron_service_1.CronService.getInstance();
    cronService.init();
    return app;
}
