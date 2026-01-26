import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { s3Service } from '../../../services/s3.service';

const storage = multer.memoryStorage(); // Switch to memory storage for S3 uploads

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

export const uploadController = {
    uploadImage: async (req: Request, res: Response) => {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        try {
            const fileBuffer = req.file.buffer;
            const fileExt = path.extname(req.file.originalname);
            const fileName = path.basename(req.file.originalname, fileExt).replace(/[^a-zA-Z0-9]/g, '-'); // Sanitize
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);

            const outputFileName = `processed-${fileName}-${uniqueSuffix}.webp`;
            const thumbFileName = `thumb-${fileName}-${uniqueSuffix}.webp`;

            // Process image: resize, compress, convert to webp
            const processedBuffer = await sharp(fileBuffer)
                .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 80 })
                .toBuffer();

            // Generate thumbnail
            const thumbBuffer = await sharp(fileBuffer)
                .resize(300, 300, { fit: 'cover' })
                .webp({ quality: 70 })
                .toBuffer();

            // Upload to S3
            const [url, thumbnailUrl] = await Promise.all([
                s3Service.uploadFile(processedBuffer, outputFileName, 'image/webp'),
                s3Service.uploadFile(thumbBuffer, thumbFileName, 'image/webp')
            ]);

            // Get metadata from processed buffer if needed, or re-read. 
            // Sharp can give metadata with toBuffer but via resolveWithObject?
            // For simplicity, reading metadata from sharp instance again if needed, OR just return size from buffer.
            const metadata = await sharp(processedBuffer).metadata();

            res.json({
                url: url,
                thumbnail: thumbnailUrl,
                metadata: {
                    width: metadata.width,
                    height: metadata.height,
                    size: processedBuffer.length,
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

            const results = await Promise.all(files.map(async (file) => {
                const fileBuffer = file.buffer;
                const fileExt = path.extname(file.originalname);
                const fileName = path.basename(file.originalname, fileExt).replace(/[^a-zA-Z0-9]/g, '-');
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);

                const outputFileName = `processed-${fileName}-${uniqueSuffix}.webp`;
                const thumbFileName = `thumb-${fileName}-${uniqueSuffix}.webp`;

                const processedBuffer = await sharp(fileBuffer)
                    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
                    .webp({ quality: 80 })
                    .toBuffer();

                const thumbBuffer = await sharp(fileBuffer)
                    .resize(300, 300, { fit: 'cover' })
                    .webp({ quality: 70 })
                    .toBuffer();

                const [url, thumbnailUrl] = await Promise.all([
                    s3Service.uploadFile(processedBuffer, outputFileName, 'image/webp'),
                    s3Service.uploadFile(thumbBuffer, thumbFileName, 'image/webp')
                ]);

                const metadata = await sharp(processedBuffer).metadata();

                return {
                    url: url,
                    thumbnail: thumbnailUrl,
                    metadata: {
                        width: metadata.width,
                        height: metadata.height,
                        size: processedBuffer.length,
                        format: 'webp',
                        originalName: file.originalname
                    }
                };
            }));

            res.json({ data: results });
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
            const thumbFileName = `thumb-${fileName}.webp`;

            const processedBuffer = await sharp(nodeBuffer)
                .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 80 })
                .toBuffer();

            const thumbBuffer = await sharp(nodeBuffer)
                .resize(300, 300, { fit: 'cover' })
                .webp({ quality: 70 })
                .toBuffer();

            const [s3Url, thumbnailUrl] = await Promise.all([
                s3Service.uploadFile(processedBuffer, outputFileName, 'image/webp'),
                s3Service.uploadFile(thumbBuffer, thumbFileName, 'image/webp')
            ]);

            const metadata = await sharp(processedBuffer).metadata();

            res.json({
                url: s3Url,
                thumbnail: thumbnailUrl,
                metadata: {
                    width: metadata.width,
                    height: metadata.height,
                    size: processedBuffer.length,
                    format: 'webp'
                }
            });
        } catch (error: any) {
            console.error('External URL processing failed:', error);
            res.status(500).json({ error: 'Failed to process external image' });
        }
    }
};
