import { Request, Response } from 'express';

export class ResourceController {
    async upload(req: Request, res: Response) {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Construct full URL or relative path
        // Assuming the server serves /uploads at root or /api/uploads
        // In server.ts: app.use('/uploads', express.static('uploads'));
        const fileUrl = `/uploads/${req.file.filename}`;

        res.json({
            data: {
                url: fileUrl,
                filename: req.file.filename,
                mimetype: req.file.mimetype,
                size: req.file.size,
                originalName: req.file.originalname
            }
        });
    }
}
