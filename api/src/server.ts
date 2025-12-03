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
;

export function createServer(): Application {
  const app = express()

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

  app.use('/healthz', healthRouter)
  app.use('/api/v1/auth', authRouter)
  app.use('/api/v1/users', usersRouter)
  app.use('/api/v1/profile', profileRouter)

  app.use('/api/v1/assessment', assessmentRouter)
  app.use('/api/v1/lms', lmsRouter)
  app.use('/api/v1/dashboard', dashboardRouter)
  app.use('/api/v1/marketplace', marketplaceRouter)
  app.use('/api/v1/marketplace', storeRouter);
  app.use('/api/v1/marketplace', uploadRouter);
  app.use('/api/v1/marketplace', cartRouter);
  app.use('/api/v1/financing', financingRouter);
  app.use('/api/v1/documents', documentRouter);
  app.use('/api/v1/export', exportRouter);
  app.use('/api/v1/community', communityRouter);
  app.use('/api/v1/programs', programRouter);
  app.use('/api/v1/umkm', umkmRouter);

  // Serve uploaded files
  app.use('/uploads', express.static('uploads'));

  app.get('/', (_req, res) => {
    res.json({ name: 'Semindo API', version: '0.1.0' })
  })

  app.use((req, res) => {
    res.status(404).json({ error: 'Not Found', path: req.path })
  })

  return app
}
