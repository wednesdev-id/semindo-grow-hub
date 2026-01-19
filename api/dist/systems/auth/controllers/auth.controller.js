"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const authService = new auth_service_1.AuthService();
class AuthController {
    async register(req, res) {
        try {
            const result = await authService.register(req.body);
            res.status(201).json({
                success: true,
                message: 'Registration successful',
                data: result
            });
        }
        catch (error) {
            res.status(400).json({
                success: false,
                error: error.message
            });
        }
    }
    async login(req, res) {
        try {
            const result = await authService.login(req.body);
            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: result
            });
        }
        catch (error) {
            res.status(401).json({
                success: false,
                error: error.message
            });
        }
    }
    async getMe(req, res) {
        try {
            // @ts-ignore - userId added by auth middleware
            const userId = req.user?.userId;
            if (!userId) {
                throw new Error('Unauthorized');
            }
            const result = await authService.getMe(userId);
            res.status(200).json({
                success: true,
                data: result
            });
        }
        catch (error) {
            res.status(401).json({
                success: false,
                error: error.message
            });
        }
    }
    async logout(_req, res) {
        // Client-side logout (clear token)
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        });
    }
}
exports.AuthController = AuthController;
