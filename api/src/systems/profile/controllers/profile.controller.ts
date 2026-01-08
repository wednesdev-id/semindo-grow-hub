
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

    // Get all UMKM profiles for current user
    async getMyUMKMProfiles(req: Request, res: Response) {
        try {
            const userId = req.user?.userId
            if (!userId) throw new Error('Unauthorized')

            const profiles = await profileService.getUserUMKMProfiles(userId)
            res.json({ success: true, data: profiles })
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message })
        }
    }

    // Get specific UMKM profile by ID
    async getUMKMProfile(req: Request, res: Response) {
        try {
            const { id } = req.params
            const profile = await profileService.getUMKMProfileById(id)
            res.json({ success: true, data: profile })
        } catch (error: any) {
            res.status(404).json({ success: false, error: error.message })
        }
    }

    // Create new UMKM profile
    async createUMKM(req: Request, res: Response) {
        try {
            const userId = req.user?.userId
            if (!userId) throw new Error('Unauthorized')

            const result = await profileService.createUMKMProfile(userId, req.body)
            res.status(201).json({ success: true, data: result })
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message })
        }
    }

    // Update UMKM profile (backward compatible - uses upsert for first profile)
    async updateUMKM(req: Request, res: Response) {
        try {
            console.log('updateUMKM called', req.body)
            const userId = req.user?.userId
            console.log('userId', userId)
            if (!userId) throw new Error('Unauthorized')

            // Check if profileId is provided in body or params
            const profileId = req.params.id || req.body.profileId
            const result = await profileService.upsertUMKMProfile(userId, req.body, profileId)
            console.log('updateUMKM result', result)
            res.json({ success: true, data: result })
        } catch (error: any) {
            console.error('updateUMKM error', error)
            res.status(400).json({ success: false, error: error.message })
        }
    }

    // Update specific UMKM profile by ID
    async updateUMKMById(req: Request, res: Response) {
        try {
            const { id } = req.params
            const result = await profileService.updateUMKMProfile(id, req.body)
            res.json({ success: true, data: result })
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message })
        }
    }

    // Delete UMKM profile
    async deleteUMKM(req: Request, res: Response) {
        try {
            const { id } = req.params
            const userId = req.user?.userId
            if (!userId) throw new Error('Unauthorized')

            // Verify user owns this profile before deleting
            const profile = await profileService.getUMKMProfileById(id)
            if (profile.userId !== userId) {
                throw new Error('You can only delete your own UMKM profiles')
            }

            const result = await profileService.deleteUMKMProfile(id)
            res.json({ success: true, data: result })
        } catch (error: any) {
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

    // Admin: Get all pending UMKM profiles
    async getPendingProfiles(req: Request, res: Response) {
        try {
            const profiles = await profileService.getPendingUMKMProfiles()
            res.json({ success: true, data: profiles })
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message })
        }
    }

    // Admin: Approve UMKM profile
    async approveUMKM(req: Request, res: Response) {
        try {
            const { id } = req.params
            const userId = req.user?.userId
            if (!userId) throw new Error('Unauthorized')

            const result = await profileService.approveUMKMProfile(id, userId)
            res.json({ success: true, data: result, message: 'UMKM profile approved successfully' })
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message })
        }
    }

    // Admin: Reject UMKM profile
    async rejectUMKM(req: Request, res: Response) {
        try {
            const { id } = req.params
            const { reason } = req.body
            const userId = req.user?.userId
            if (!userId) throw new Error('Unauthorized')

            if (!reason) throw new Error('Rejection reason is required')

            const result = await profileService.rejectUMKMProfile(id, reason, userId)
            res.json({ success: true, data: result, message: 'UMKM profile rejected' })
        } catch (error: any) {
            res.status(400).json({ success: false, error: error.message })
        }
    }
}
