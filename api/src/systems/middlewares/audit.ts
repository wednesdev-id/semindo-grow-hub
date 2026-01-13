import { Request, Response, NextFunction } from 'express'

export function auditMiddleware(req: Request, _res: Response, next: NextFunction) {
  const start = process.hrtime.bigint()
  req.on('close', () => {
    const end = process.hrtime.bigint()
    const ms = Number(end - start) / 1_000_000
    // no comments
    process.stdout.write(`${new Date().toISOString()} ${req.method} ${req.originalUrl} ${ms.toFixed(1)}ms\n`)
  })
  next()
}
