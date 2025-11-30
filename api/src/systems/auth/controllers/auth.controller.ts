import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';
import { LoginDto, RegisterDto } from '../types/auth.types';

const authService = new AuthService()

export class AuthController {
    async register(req: Request<{}, {}, RegisterDto>, res: Response) {
        try {
            const result = await authService.register(req.body)
            res.status(201).json({
                success: true,
                message: 'Registration successful',
                data: result
            })
        } catch (error: any) {
            res.status(400).json({
                success: false,
                error: error.message
            })
        }
    }

    async login(req: Request<{}, {}, LoginDto>, res: Response) {
        try {
            const result = await authService.login(req.body)
            res.status(200).json({
                success: true,
                message: 'Login successful',
                data: result
            })
        } catch (error: any) {
            res.status(401).json({
                success: false,
                error: error.message
            })
        }
    }

    async getMe(req: Request, res: Response) {
        try {
            // @ts-ignore - userId added by auth middleware
            const userId = req.user?.userId
            if (!userId) {
                throw new Error('Unauthorized')
            }

            const result = await authService.getMe(userId)
            res.status(200).json({
                success: true,
                data: result
            })
        } catch (error: any) {
            res.status(401).json({
                success: false,
                error: error.message
            })
        }
    }

    async logout(_req: Request, res: Response) {
        // Client-side logout (clear token)
        res.status(200).json({
            success: true,
            message: 'Logged out successfully'
        })
    }
}
