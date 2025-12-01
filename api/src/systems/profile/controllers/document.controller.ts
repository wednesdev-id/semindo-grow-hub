import { Request, Response } from 'express';
import { DocumentService } from '../services/document.service';

const documentService = new DocumentService();

export class DocumentController {
    async upload(req: Request, res: Response) {
        try {
            const userId = (req as any).user.userId;
            const file = req.file;
            const { type, number } = req.body;

            if (!file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            if (!type) {
                return res.status(400).json({ message: 'Document type is required' });
            }

            const document = await documentService.uploadDocument(userId, file, type, number);
            res.status(201).json({ data: document });
        } catch (error: any) {
            console.error('Upload error:', error);
            res.status(500).json({ message: error.message || 'Failed to upload document' });
        }
    }

    async list(req: Request, res: Response) {
        try {
            const userId = (req as any).user.userId;
            const documents = await documentService.getDocuments(userId);
            res.json({ data: documents });
        } catch (error: any) {
            res.status(500).json({ message: error.message || 'Failed to fetch documents' });
        }
    }

    async delete(req: Request, res: Response) {
        try {
            const userId = (req as any).user.userId;
            const { id } = req.params;
            await documentService.deleteDocument(id, userId);
            res.json({ message: 'Document deleted successfully' });
        } catch (error: any) {
            res.status(500).json({ message: error.message || 'Failed to delete document' });
        }
    }
}
