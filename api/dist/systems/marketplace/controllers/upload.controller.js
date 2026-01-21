"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadController = exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadPath = 'uploads/';
        if (!fs_1.default.existsSync(uploadPath)) {
            fs_1.default.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
exports.upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only images are allowed'));
        }
    }
});
const sharp_1 = __importDefault(require("sharp"));
exports.uploadController = {
    uploadImage: async (req, res) => {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        try {
            const filePath = req.file.path;
            const fileExt = path_1.default.extname(req.file.originalname);
            const fileName = path_1.default.basename(req.file.filename, fileExt);
            const outputFileName = `processed-${fileName}.webp`;
            const outputPath = path_1.default.join('uploads', outputFileName);
            const thumbFileName = `thumb-${fileName}.webp`;
            const thumbPath = path_1.default.join('uploads', thumbFileName);
            // Define base URL for response (using relative path for better proxy compatibility)
            const baseUrl = `/uploads`;
            // Process image: resize, compress, convert to webp
            const metadata = await (0, sharp_1.default)(filePath)
                .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 80 })
                .toFile(outputPath);
            // Generate thumbnail
            await (0, sharp_1.default)(filePath)
                .resize(300, 300, { fit: 'cover' })
                .webp({ quality: 70 })
                .toFile(thumbPath);
            // Cleanup original uploaded file
            fs_1.default.unlinkSync(filePath);
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
        }
        catch (error) {
            console.error('Image processing failed:', error);
            res.status(500).json({ error: 'Failed to process image' });
        }
    },
    uploadMultipleImages: async (req, res) => {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ error: 'No files uploaded' });
        }
        try {
            const files = req.files;
            const baseUrl = `/uploads`;
            const results = await Promise.all(files.map(async (file) => {
                const filePath = file.path;
                const fileExt = path_1.default.extname(file.originalname);
                const fileName = path_1.default.basename(file.filename, fileExt);
                const outputFileName = `processed-${fileName}.webp`;
                const outputPath = path_1.default.join('uploads', outputFileName);
                const thumbFileName = `thumb-${fileName}.webp`;
                const thumbPath = path_1.default.join('uploads', thumbFileName);
                const metadata = await (0, sharp_1.default)(filePath)
                    .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
                    .webp({ quality: 80 })
                    .toFile(outputPath);
                await (0, sharp_1.default)(filePath)
                    .resize(300, 300, { fit: 'cover' })
                    .webp({ quality: 70 })
                    .toFile(thumbPath);
                // Cleanup original uploaded file
                if (fs_1.default.existsSync(filePath)) {
                    fs_1.default.unlinkSync(filePath);
                }
                return {
                    url: `${baseUrl}/${outputFileName}`,
                    thumbnail: `${baseUrl}/${thumbFileName}`,
                    metadata: {
                        width: metadata.width,
                        height: metadata.height,
                        size: metadata.size,
                        format: 'webp',
                        originalName: file.originalname
                    }
                };
            }));
            res.json({ data: results });
        }
        catch (error) {
            console.error('Multiple images processing failed:', error);
            res.status(500).json({ error: 'Failed to process images' });
        }
    },
    uploadFromUrl: async (req, res) => {
        const { url } = req.body;
        if (!url) {
            return res.status(400).json({ error: 'URL is required' });
        }
        try {
            const response = await fetch(url);
            if (!response.ok)
                throw new Error(`Failed to fetch image: ${response.statusText}`);
            const buffer = await response.arrayBuffer();
            const nodeBuffer = Buffer.from(buffer);
            const fileName = `ext-${Date.now()}`;
            const outputFileName = `processed-${fileName}.webp`;
            const outputPath = path_1.default.join('uploads', outputFileName);
            const thumbFileName = `thumb-${fileName}.webp`;
            const thumbPath = path_1.default.join('uploads', thumbFileName);
            const metadata = await (0, sharp_1.default)(nodeBuffer)
                .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 80 })
                .toFile(outputPath);
            await (0, sharp_1.default)(nodeBuffer)
                .resize(300, 300, { fit: 'cover' })
                .webp({ quality: 70 })
                .toFile(thumbPath);
            const baseUrl = `/uploads`;
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
        }
        catch (error) {
            console.error('External URL processing failed:', error);
            res.status(500).json({ error: 'Failed to process external image' });
        }
    }
};
