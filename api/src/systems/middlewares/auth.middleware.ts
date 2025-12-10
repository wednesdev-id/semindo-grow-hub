import { Request, Response, NextFunction } from 'express'
import { verifyToken, TokenPayload } from '../utils/jwt'

declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload
        }
    }
}

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization
        if (!authHeader?.startsWith('Bearer ')) {
            console.error('[Auth] No token provided')
            return res.status(401).json({ success: false, error: 'No token provided' })
        }

        const token = authHeader.split(' ')[1]
        const decoded = verifyToken(token)

        // Explicitly set user with proper type
        req.user = decoded

        console.log('[Auth] User authenticated:', { userId: decoded.userId, email: decoded.email, roles: decoded.roles })
        next()
    } catch (error: any) {
        console.error('[Auth] Token verification failed:', error.message)
        return res.status(401).json({ success: false, error: 'Invalid token' })
    }
}

export const requireRole = (roles: string[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.user) {
            return res.status(401).json({ success: false, error: 'Unauthorized' })
        }

        const hasRole = req.user.roles.some(role => roles.includes(role))
        if (!hasRole) {
            return res.status(403).json({ success: false, error: 'Forbidden' })
        }

        next()
    }
}

export const authorize = requireRole;
