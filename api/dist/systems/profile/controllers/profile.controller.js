"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileController = void 0;
const profile_service_1 = require("../services/profile.service");
const profileService = new profile_service_1.ProfileService();
class ProfileController {
    async getMe(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new Error('Unauthorized');
            const result = await profileService.getProfile(userId);
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
    async updateUMKM(req, res) {
        try {
            console.log('updateUMKM called', req.body);
            const userId = req.user?.userId;
            console.log('userId', userId);
            if (!userId)
                throw new Error('Unauthorized');
            const result = await profileService.updateUMKMProfile(userId, req.body);
            console.log('updateUMKM result', result);
            res.json({ success: true, data: result });
        }
        catch (error) {
            console.error('updateUMKM error', error);
            res.status(400).json({ success: false, error: error.message });
        }
    }
    async updateMentor(req, res) {
        try {
            const userId = req.user?.userId;
            if (!userId)
                throw new Error('Unauthorized');
            const result = await profileService.updateMentorProfile(userId, req.body);
            res.json({ success: true, data: result });
        }
        catch (error) {
            res.status(400).json({ success: false, error: error.message });
        }
    }
}
exports.ProfileController = ProfileController;
