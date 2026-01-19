import { Request, Response } from 'express';
import { UMKMService } from '../services/umkm.service';
import { MentoringService } from '../services/mentoring.service';
import { DocumentService } from '../services/document.service';

const umkmService = new UMKMService();
const mentoringService = new MentoringService();
const documentService = new DocumentService();

export class UMKMController {
    // UMKM Profile
    static async getProfiles(req: Request, res: Response) {
        try {
            console.log('[UMKM] GET /umkm - Query:', req.query);
            const params = {
                page: parseInt(req.query.page as string) || 1,
                limit: parseInt(req.query.limit as string) || 10,
                search: req.query.search as string,
                segmentation: req.query.segmentation as string,
                city: req.query.city as string,
                province: req.query.province as string,
                sector: req.query.sector as string,
            };
            const result = await umkmService.findAll(params);
            res.json(result);
        } catch (error) {
            console.error('[UMKM] Error fetching profiles:', error);
            res.status(500).json({ error: 'Failed to fetch profiles' });
        }
    }

    static async getStats(req: Request, res: Response) {
        try {
            const stats = await umkmService.getStats();
            res.json(stats);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch stats' });
        }
    }

    static async getProfile(req: Request, res: Response) {
        try {
            const profile = await umkmService.findById(req.params.id);
            if (!profile) return res.status(404).json({ error: 'Profile not found' });
            res.json(profile);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch profile' });
        }
    }

    static async createProfile(req: Request, res: Response) {
        try {
            const userId = (req as any).user.userId as string;
            const profile = await umkmService.create(userId, req.body);
            res.status(201).json(profile);
        } catch (error) {
            console.error('Error creating profile:', error);
            res.status(500).json({ error: 'Failed to create profile' });
        }
    }

    static async updateProfile(req: Request, res: Response) {
        try {
            const profile = await umkmService.update(req.params.id, req.body);
            res.json(profile);
        } catch (error) {
            res.status(500).json({ error: 'Failed to update profile' });
        }
    }

    // Mentoring
    static async addMentoringSession(req: Request, res: Response) {
        try {
            const session = await mentoringService.createSession(req.body);
            res.status(201).json(session);
        } catch (error) {
            res.status(500).json({ error: 'Failed to add session' });
        }
    }

    static async getMentoringSessions(req: Request, res: Response) {
        try {
            const sessions = await mentoringService.getSessionsByUMKM(req.params.id);
            res.json(sessions);
        } catch (error) {
            res.status(500).json({ error: 'Failed to fetch sessions' });
        }
    }

    // Documents
    static async uploadDocument(req: Request, res: Response) {
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
        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({ error: 'Failed to upload document' });
        }
    }

    static async verifyDocument(req: Request, res: Response) {
        try {
            const verifierId = (req as any).user.userId as string;
            const { status, reason } = req.body;
            const doc = await documentService.verifyDocument(req.params.docId, verifierId, status, reason);
            res.json(doc);
        } catch (error) {
            res.status(500).json({ error: 'Failed to verify document' });
        }
    }
}
