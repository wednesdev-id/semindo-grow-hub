"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
exports.processProfilePicture = processProfilePicture;
exports.deleteProfilePicture = deleteProfilePicture;
exports.getPublicUrl = getPublicUrl;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const sharp_1 = __importDefault(require("sharp"));
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads/profiles';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '5242880'); // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
// Ensure upload directory exists
if (!fs_1.default.existsSync(UPLOAD_DIR)) {
    fs_1.default.mkdirSync(UPLOAD_DIR, { recursive: true });
}
// Configure multer storage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path_1.default.extname(file.originalname);
        cb(null, `profile-${uniqueSuffix}${ext}`);
    }
});
// File filter
const fileFilter = (req, file, cb) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error('Invalid file type. Only JPEG, PNG and WebP are allowed.'));
    }
};
// Multer upload instance
exports.upload = (0, multer_1.default)({
    storage,
    fileFilter,
    limits: {
        fileSize: MAX_FILE_SIZE
    }
});
/**
 * Process and optimize uploaded image
 */
async function processProfilePicture(filePath) {
    const outputPath = filePath.replace(path_1.default.extname(filePath), '-optimized.webp');
    await (0, sharp_1.default)(filePath)
        .resize(400, 400, {
        fit: 'cover',
        position: 'center'
    })
        .webp({ quality: 85 })
        .toFile(outputPath);
    // Delete original file
    fs_1.default.unlinkSync(filePath);
    return outputPath;
}
/**
 * Delete profile picture file
 */
function deleteProfilePicture(filePath) {
    if (fs_1.default.existsSync(filePath)) {
        fs_1.default.unlinkSync(filePath);
    }
}
/**
 * Get public URL for uploaded file
 */
function getPublicUrl(filePath) {
    // Remove the upload directory prefix and return relative path
    return filePath.replace(UPLOAD_DIR, '/uploads/profiles');
}
