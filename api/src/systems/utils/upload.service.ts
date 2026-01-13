import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads/profiles';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880'); // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `profile-${uniqueSuffix}${ext}`);
    }
});

// File filter
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPEG, PNG and WebP are allowed.'));
    }
};

// Multer upload instance
export const upload = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE
    }
});

/**
 * Process and optimize uploaded image
 */
export async function processProfilePicture(filePath: string): Promise<string> {
    const outputPath = filePath.replace(path.extname(filePath), '-optimized.webp');

    await sharp(filePath)
        .resize(400, 400, {
            fit: 'cover',
            position: 'center'
        })
        .webp({ quality: 85 })
        .toFile(outputPath);

    // Delete original file
    fs.unlinkSync(filePath);

    return outputPath;
}

/**
 * Delete profile picture file
 */
export function deleteProfilePicture(filePath: string): void {
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
    }
}

/**
 * Get public URL for uploaded file
 */
export function getPublicUrl(filePath: string): string {
    // Remove the upload directory prefix and return relative path
    return filePath.replace(UPLOAD_DIR, '/uploads/profiles');
}
