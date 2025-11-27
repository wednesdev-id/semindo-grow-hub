import express, { Application } from 'express'
import { healthRouter } from './systems/health'
import { assessmentRouter } from './systems/assessment'
import { securityMiddleware } from './systems/middlewares/security'
import { auditMiddleware } from './systems/middlewares/audit'
import { corsMiddleware } from './systems/middlewares/cors'

export function createServer(): Application {
  const app = express()

  app.disable('x-powered-by')
  app.use(express.json({ limit: '1mb' }))
  app.use(corsMiddleware)
  app.use(securityMiddleware)
  app.use(auditMiddleware)

  app.use('/healthz', healthRouter)
  app.use('/assessment', assessmentRouter)

  app.get('/', (_req, res) => {
    res.json({ name: 'Semindo API', version: '0.1.0' })
  })

  app.use((req, res) => {
    res.status(404).json({ error: 'Not Found', path: req.path })
  })

  return app
}
