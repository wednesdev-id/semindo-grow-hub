import { Request, Response } from 'express';
import * as fileService from '../services/file.service';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../../../uploads/consultation');
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|txt/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only images, PDFs, and Office documents are allowed.'));
        }
    }
}).single('file');

/**
 * Upload file endpoint
 */
export const uploadFileHandler = (req: Request, res: Response) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }

        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        try {
            const requestId = req.params.id;
            const consultantUserId = (req as any).user.id;
            const description = req.body.description;

            const fileUrl = `/uploads/consultation/${req.file.filename}`;

            const file = await fileService.uploadFile(requestId, consultantUserId, {
                fileName: req.file.originalname,
                fileUrl: fileUrl,
                fileSize: req.file.size,
                mimeType: req.file.mimetype,
                description: description
            });

            res.json({ success: true, data: file });
        } catch (error: any) {
            res.status(400).json({ success: false, message: error.message });
        }
    });
};

/**
 * Get files for a request
 */
export const getFiles = async (req: Request, res: Response) => {
    try {
        const requestId = req.params.id;
        const userId = (req as any).user.id;

        const files = await fileService.getFiles(requestId, userId);
        res.json({ success: true, data: files });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * Delete a file
 */
export const deleteFile = async (req: Request, res: Response) => {
    try {
        const fileId = req.params.fileId;
        const consultantUserId = (req as any).user.id;

        await fileService.deleteFile(fileId, consultantUserId);
        res.json({ success: true, message: 'File deleted successfully' });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};
