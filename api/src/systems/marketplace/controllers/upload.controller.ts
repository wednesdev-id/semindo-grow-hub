import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

export const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only images are allowed'));
        }
    }
});

import sharp from 'sharp';

export const uploadController = {
    uploadImage: async (req: Request, res: Response) => {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        try {
            const filePath = req.file.path;
            const fileExt = path.extname(req.file.originalname);
            const fileName = path.basename(req.file.filename, fileExt);
            const outputFileName = `processed-${fileName}.webp`;
            const outputPath = path.join('uploads', outputFileName);
            const thumbFileName = `thumb-${fileName}.webp`;
            const thumbPath = path.join('uploads', thumbFileName);

            // Define base URL for response
            const baseUrl = `${req.protocol}://${req.get('host')}/uploads`;

            // Process image: resize, compress, convert to webp
            const metadata = await sharp(filePath)
                .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 80 })
                .toFile(outputPath);

            // Generate thumbnail
            await sharp(filePath)
                .resize(300, 300, { fit: 'cover' })
                .webp({ quality: 70 })
                .toFile(thumbPath);

            // Cleanup original uploaded file
            fs.unlinkSync(filePath);

            res.json({
                url: `${baseUrl}/${outputFileName}`,
                thumbnail: `${baseUrl}/${thumbFileName}`,
                metadata: {
                    width: metadata.width,
                    height: metadata.height,
                    size: metadata.size,
                    format: 'webp'
                }
            });
        } catch (error: any) {
            console.error('Image processing failed:', error);
            res.status(500).json({ error: 'Failed to process image' });
        }
    },

    uploadMultipleImages: async (req: Request, res: Response) => {
        if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }

        try {
            const files = req.files as Express.Multer.File[];
            const baseUrl = `${req.protocol}://${req.get('host')}/uploads`;

            const results = await Promise.all(files.map(async (file) => {
                const filePath = file.path;
                const fileExt = path.extname(file.originalname);
                const fileName = path.basename(file.filename, fileExt);
                const outputFileName = `processed-${fileName}.webp`;
                const outputPath = path.join('uploads', outputFileName);
                const thumbFileName = `thumb-${fileName}.webp`;
                const thumbPath = path.join('uploads', thumbFileName);

                const metadata = await sharp(filePath)
                    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
                    .webp({ quality: 80 })
                    .toFile(outputPath);

                await sharp(filePath)
                    .resize(300, 300, { fit: 'cover' })
                    .webp({ quality: 70 })
                    .toFile(thumbPath);
                return {
                    url: `${baseUrl}/${outputFileName}`,
                    thumbnail: `${baseUrl}/${thumbFileName}`,
                    metadata: {
                        width: metadata.width,
                        height: metadata.height,
                        size: metadata.size,
                        format: 'webp'
                    }
                };
            }));

            res.json({ images: results });
        } catch (error: any) {
            console.error('Multiple images processing failed:', error);
            res.status(500).json({ error: 'Failed to process images' });
        }
    },

    uploadFromUrl: async (req: Request, res: Response) => {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }

        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);

            const buffer = await response.arrayBuffer();
            const nodeBuffer = Buffer.from(buffer);

            const fileName = `ext-${Date.now()}`;
            const outputFileName = `processed-${fileName}.webp`;
            const outputPath = path.join('uploads', outputFileName);
            const thumbFileName = `thumb-${fileName}.webp`;
            const thumbPath = path.join('uploads', thumbFileName);

            const metadata = await sharp(nodeBuffer)
                .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 80 })
                .toFile(outputPath);

            await sharp(nodeBuffer)
                .resize(300, 300, { fit: 'cover' })
                .webp({ quality: 70 })
                .toFile(thumbPath);

            const baseUrl = `${req.protocol}://${req.get('host')}/uploads`;

            res.json({
                url: `${baseUrl}/${outputFileName}`,
                thumbnail: `${baseUrl}/${thumbFileName}`,
                metadata: {
                    width: metadata.width,
                    height: metadata.height,
                    size: metadata.size,
                    format: 'webp'
                }
            });
        } catch (error: any) {
            console.error('External URL processing failed:', error);
            res.status(500).json({ error: 'Failed to process external image' });
        }
    }
};
