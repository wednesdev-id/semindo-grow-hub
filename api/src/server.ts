import express, { Application } from 'express'
import compression from 'compression';
import { apiLimiter } from './systems/middlewares/rateLimit.middleware';
import { healthRouter } from './systems/health'
import { assessmentRouter } from './systems/assessment'
import { authRouter } from './systems/auth'
import { usersRouter } from './systems/users'
import { profileRouter } from './systems/profile'
import { securityMiddleware } from './systems/middlewares/security'
import { auditMiddleware } from './systems/middlewares/audit'
import { corsMiddleware } from './systems/middlewares/cors'
import { lmsRouter } from './systems/lms'
import { dashboardRouter } from './systems/dashboard'
import { marketplaceRouter } from './systems/marketplace'
import { financingRouter } from './systems/financing'
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
  app.use('/api/v1/financing', financingRouter);

  app.get('/', (_req, res) => {
    res.json({ name: 'Semindo API', version: '0.1.0' })
  })

  app.use((req, res) => {
    res.status(404).json({ error: 'Not Found', path: req.path })
  })

  return app
}
