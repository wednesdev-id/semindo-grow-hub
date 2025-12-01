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
            return res.status(401).json({ success: false, error: 'No token provided' })
        }

        const token = authHeader.split(' ')[1]
        const decoded = verifyToken(token)

        req.user = decoded
        next()
    } catch (error) {
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
