"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.requireRole = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const authenticate = (req, res, next) => {
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
            const decoded = (0, jwt_1.verifyToken)(token);
            console.log('[Auth] ✅ Token verified successfully');
            console.log('[Auth] User:', { userId: decoded.userId, email: decoded.email, roles: decoded.roles });
            req.user = {
                userId: decoded.userId,
                id: decoded.userId,
                email: decoded.email,
                roles: decoded.roles
            };
            next();
        }
        catch (tokenError) {
            console.error('[Auth] ❌ Token verification failed:', tokenError);
            return res.status(401).json({ error: 'Invalid token', details: tokenError.message });
        }
    }
    catch (error) {
        console.error('[Auth] ❌ Authentication error:', error);
        res.status(401).json({ error: 'Authentication failed' });
    }
};
exports.authenticate = authenticate;
const requireRole = (roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ success: false, error: 'Unauthorized' });
        }
        const hasRole = req.user.roles.some(role => roles.includes(role));
        if (!hasRole) {
            return res.status(403).json({ success: false, error: 'Forbidden' });
        }
        next();
    };
};
exports.requireRole = requireRole;
exports.authorize = exports.requireRole;
