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
;
function createServer() {
    const app = (0, express_1.default)();
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
    app.use('/healthz', health_1.healthRouter);
    app.use('/api/v1/auth', auth_1.authRouter);
    app.use('/api/v1/users', users_1.usersRouter);
    app.use('/api/v1/profile', profile_1.profileRouter);
    app.use('/api/v1/assessment', assessment_1.assessmentRouter);
    app.use('/api/v1/lms', lms_1.lmsRouter);
    app.use('/api/v1/dashboard', dashboard_1.dashboardRouter);
    app.use('/api/v1/marketplace', marketplace_1.marketplaceRouter);
    app.use('/api/v1/marketplace', store_routes_1.storeRouter);
    app.use('/api/v1/marketplace', upload_routes_1.uploadRouter);
    app.use('/api/v1/marketplace', cart_routes_1.cartRouter);
    app.use('/api/v1/financing', financing_1.financingRouter);
    app.use('/api/v1/documents', profile_1.documentRouter);
    app.use('/api/v1/export', export_1.exportRouter);
    app.use('/api/v1/community', community_1.communityRouter);
    app.use('/api/v1/programs', program_1.programRouter);
    app.use('/api/v1/umkm', umkm_1.umkmRouter);
    // Serve uploaded files
    app.use('/uploads', express_1.default.static('uploads'));
    app.get('/', (_req, res) => {
        res.json({ name: 'Semindo API', version: '0.1.0' });
    });
    app.use((req, res) => {
        res.status(404).json({ error: 'Not Found', path: req.path });
    });
    return app;
}
