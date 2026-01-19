"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UMKMController = void 0;
const umkm_service_1 = require("../services/umkm.service");
const mentoring_service_1 = require("../services/mentoring.service");
const document_service_1 = require("../services/document.service");
const umkmService = new umkm_service_1.UMKMService();
const mentoringService = new mentoring_service_1.MentoringService();
const documentService = new document_service_1.DocumentService();
class UMKMController {
    // UMKM Profile
    static async getProfiles(req, res) {
        try {
            const result = await umkmService.findAll(req.query);
            res.json(result);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch profiles' });
        }
    }
    static async getStats(req, res) {
        try {
            const stats = await umkmService.getStats();
            res.json(stats);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch stats' });
        }
    }
    static async getProfile(req, res) {
        try {
            const profile = await umkmService.findById(req.params.id);
            if (!profile)
                return res.status(404).json({ error: 'Profile not found' });
            res.json(profile);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch profile' });
        }
    }
    static async createProfile(req, res) {
        try {
            const userId = req.user.userId;
            const profile = await umkmService.create(userId, req.body);
            res.status(201).json(profile);
        }
        catch (error) {
            console.error('Error creating profile:', error);
            res.status(500).json({ error: 'Failed to create profile' });
        }
    }
    static async updateProfile(req, res) {
        try {
            const profile = await umkmService.update(req.params.id, req.body);
            res.json(profile);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to update profile' });
        }
    }
    // Mentoring
    static async addMentoringSession(req, res) {
        try {
            const session = await mentoringService.createSession(req.body);
            res.status(201).json(session);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to add session' });
        }
    }
    static async getMentoringSessions(req, res) {
        try {
            const sessions = await mentoringService.getSessionsByUMKM(req.params.id);
            res.json(sessions);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to fetch sessions' });
        }
    }
    // Documents
    static async uploadDocument(req, res) {
        try {
            const file = req.file;
            if (!file) {
                return res.status(400).json({ error: 'No file uploaded' });
            }
            const fileUrl = `/uploads/documents/${file.filename}`;
            const { type, number, expiryDate } = req.body;
            const doc = await documentService.uploadDocument({
                umkmProfileId: req.params.id,
                type,
                number,
                fileUrl,
                fileName: file.originalname,
                fileSize: file.size,
                mimeType: file.mimetype,
                expiryDate: expiryDate ? new Date(expiryDate) : undefined,
            });
            res.status(201).json(doc);
        }
        catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({ error: 'Failed to upload document' });
        }
    }
    static async verifyDocument(req, res) {
        try {
            const verifierId = req.user.userId;
            const { status, reason } = req.body;
            const doc = await documentService.verifyDocument(req.params.docId, verifierId, status, reason);
            res.json(doc);
        }
        catch (error) {
            res.status(500).json({ error: 'Failed to verify document' });
        }
    }
}
exports.UMKMController = UMKMController;
