"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = exports.requireRole = exports.authenticate = void 0;
const jwt_1 = require("../utils/jwt");
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, error: 'No token provided' });
        }
        const token = authHeader.split(' ')[1];
        const decoded = (0, jwt_1.verifyToken)(token);
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({ success: false, error: 'Invalid token' });
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
