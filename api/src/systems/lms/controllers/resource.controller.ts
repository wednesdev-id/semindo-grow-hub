import { Request, Response } from 'express';

import { s3Service } from '../../../services/s3.service';
import path from 'path';

export class ResourceController {
    async upload(req: Request, res: Response) {
        console.log('[LMS] ResourceController.upload hit');
        console.log('[LMS] Headers:', JSON.stringify(req.headers));
        console.log('[LMS] File:', req.file ? `${req.file.originalname} (${req.file.size} bytes)` : 'MISSING');
        console.log('[LMS] Body:', req.body);

        if (!req.file) {
            console.error('[LMS] Error: req.file is missing');
            return res.status(400).json({ error: 'No file uploaded' });
        }

        try {
            const fileExt = path.extname(req.file.originalname);
            // Sanitize filename
            const baseName = path.basename(req.file.originalname, fileExt).replace(/[^a-zA-Z0-9]/g, '-');
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const fileName = `lms-${baseName}-${uniqueSuffix}${fileExt}`;

            const url = await s3Service.uploadFile(
                req.file.buffer,
                fileName,
                req.file.mimetype
            );

            res.json({
                data: {
                    url: url,
                    filename: fileName,
                    mimetype: req.file.mimetype,
                    size: req.file.size,
                    originalName: req.file.originalname
                }
            });
        } catch (error: any) {
            console.error('LMS Upload Error:', error);
            res.status(500).json({ error: 'Failed to upload file' });
        }
    }
}
