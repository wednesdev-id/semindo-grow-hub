
import { Request, Response } from 'express'
import { ProfileService } from '../services/profile.service'
import { UMKMProfileDto, MentorProfileDto } from '../types/profile.types';

const profileService = new ProfileService()

export class ProfileController {
    async getMe(req: Request, res: Response) {
        try {
            const userId = req.user?.userId
            if (!userId) throw new Error('Unauthorized')

            const result = await profileService.getProfile(userId)
            res.json({ success: true, data: result })
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message })
        }
    }

    async updateUMKM(req: Request, res: Response) {
        try {
            console.log('updateUMKM called', req.body)
            const userId = req.user?.userId
            console.log('userId', userId)
            if (!userId) throw new Error('Unauthorized')

            const result = await profileService.updateUMKMProfile(userId, req.body)
            console.log('updateUMKM result', result)
            res.json({ success: true, data: result })
        } catch (error: any) {
            console.error('updateUMKM error', error)
            res.status(400).json({ success: false, error: error.message })
        }
    }

    async updateMentor(req: Request, res: Response) {
        try {
            const userId = req.user?.userId
            if (!userId) throw new Error('Unauthorized')

            const result = await profileService.updateMentorProfile(userId, req.body)
            res.json({ success: true, data: result })
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message })
        }
    }
}
