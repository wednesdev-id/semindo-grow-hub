import express, { Application } from 'express'
import compression from 'compression';
import { apiLimiter } from './systems/middlewares/rateLimit.middleware';
import { healthRouter } from './systems/health'
import { assessmentRouter } from './systems/assessment'
import { authRouter } from './systems/auth'
import { usersRouter } from './systems/users'
import { profileRouter, documentRouter } from './systems/profile'
import { securityMiddleware } from './systems/middlewares/security'
import { auditMiddleware } from './systems/middlewares/audit'
import { corsMiddleware } from './systems/middlewares/cors'
import { lmsRouter } from './systems/lms'
import { dashboardRouter } from './systems/dashboard'
import { marketplaceRouter } from './systems/marketplace'
import { storeRouter } from './systems/marketplace/routes/store.routes';
import { uploadRouter } from './systems/marketplace/routes/upload.routes';
import { cartRouter } from './systems/marketplace/routes/cart.routes';
import { financingRouter } from './systems/financing'
import { exportRouter } from './systems/export'
import { communityRouter } from './systems/community'
import { programRouter } from './systems/program';
import { umkmRouter } from './systems/umkm';
import { rolesRouter } from './systems/roles/routes/roles.routes';
import { permissionsRouter } from './systems/permissions/routes/permissions.routes';
import { auditRouter } from './systems/audit/routes/audit.routes';
import consultationRouter from './systems/consultation/routes/consultation.routes';
import { onboardingRouter } from './systems/onboarding';

import { CronService } from './systems/scheduler/cron.service';
import { featureFlags, requireFeature } from './config/feature-flags';

export function createServer(): Application {
  const app = express()

  // Log feature flags status
  console.log('[API] Feature Flags:', featureFlags);

  app.disable('x-powered-by')
  // Global Middleware
  app.use(compression())
  app.use(apiLimiter)
  app.use(express.json({ limit: '1mb' }))
  app.use(corsMiddleware)
  app.use(securityMiddleware)
  app.use(auditMiddleware)

  app.use((req, res, next) => {
    const start = Date.now()
    console.log(`[API] Incoming ${req.method} ${req.path}`)

    res.on('finish', () => {
      const duration = Date.now() - start
      console.log(`[API] Completed ${req.method} ${req.path} ${res.statusCode} [${duration}ms]`)
    })

    next()
  })

  // Core routes (always enabled)
  app.use('/healthz', healthRouter)
  app.use('/api/v1/auth', authRouter)
  app.use('/api/v1/users', usersRouter)
  app.use('/api/v1/profile', profileRouter)
  app.use('/api/v1/assessment', assessmentRouter)
  app.use('/api/v1/lms', lmsRouter)
  app.use('/api/v1/dashboard', dashboardRouter)
  app.use('/api/v1/documents', documentRouter);
  app.use('/api/v1/programs', programRouter);
  app.use('/api/v1/umkm', umkmRouter);
  app.use('/api/v1/roles', rolesRouter);
  app.use('/api/v1/permissions', permissionsRouter);
  app.use('/api/v1/audit-logs', auditRouter);
  app.use('/api/v1/consultation', consultationRouter);
  app.use('/api/v1/onboarding', onboardingRouter); // Public registration

  // Feature-flagged routes
  if (featureFlags.MARKETPLACE_ENABLED) {
    console.log('[API] Marketplace feature ENABLED');
    app.use('/api/v1/marketplace', marketplaceRouter)
    app.use('/api/v1/marketplace', storeRouter);
    app.use('/api/v1/marketplace', uploadRouter);
    app.use('/api/v1/marketplace', cartRouter);
  } else {
    // Return 404 for disabled marketplace routes
    app.use('/api/v1/marketplace', requireFeature('MARKETPLACE_ENABLED'));
  }

  if (featureFlags.FINANCING_ENABLED) {
    app.use('/api/v1/financing', financingRouter);
  }

  if (featureFlags.EXPORT_HUB_ENABLED) {
    app.use('/api/v1/export', exportRouter);
  }

  if (featureFlags.COMMUNITY_ENABLED) {
    app.use('/api/v1/community', communityRouter);
  }

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  // Initialize background jobs
  const cronService = CronService.getInstance();
  cronService.init();

  return app
}
