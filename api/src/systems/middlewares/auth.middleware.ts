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
        const authHeader = req.headers.authorization;

        console.log('[Auth] Incoming request to:', req.path);
        console.log('[Auth] Authorization header:', authHeader ? 'Present' : 'Missing');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            console.log('[Auth] ❌ No valid auth header');
            return res.status(401).json({ error: 'No token provided' });
        }

        const token = authHeader.split(' ')[1];
        console.log('[Auth] Token extracted, length:', token?.length);

        try {
            const decoded = verifyToken(token);
            console.log('[Auth] ✅ Token verified successfully');
            console.log('[Auth] User:', { userId: decoded.userId, email: decoded.email, roles: decoded.roles });

            (req as any).user = {
                userId: decoded.userId,
                id: decoded.userId,
                email: decoded.email,
                roles: decoded.roles
            };

            next();
        } catch (tokenError) {
            console.error('[Auth] ❌ Token verification failed:', tokenError);
            return res.status(401).json({ error: 'Invalid token', details: (tokenError as Error).message });
        }
    } catch (error) {
        console.error('[Auth] ❌ Authentication error:', error);
        res.status(401).json({ error: 'Authentication failed' });
    }
};

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
