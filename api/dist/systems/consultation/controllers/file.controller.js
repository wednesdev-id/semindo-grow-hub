"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFile = exports.getFiles = exports.uploadFileHandler = void 0;
const fileService = __importStar(require("../services/file.service"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Configure multer for file uploads
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path_1.default.join(__dirname, '../../../../uploads/consultation');
        // Create directory if it doesn't exist
        if (!fs_1.default.existsSync(uploadDir)) {
            fs_1.default.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path_1.default.extname(file.originalname));
    }
});
const upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|txt/;
        const extname = allowedTypes.test(path_1.default.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        else {
            cb(new Error('Invalid file type. Only images, PDFs, and Office documents are allowed.'));
        }
    }
}).single('file');
/**
 * Upload file endpoint
 */
const uploadFileHandler = (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ success: false, message: err.message });
        }
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }
        try {
            const requestId = req.params.id;
            const consultantUserId = req.user.id;
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
        }
        catch (error) {
            res.status(400).json({ success: false, message: error.message });
        }
    });
};
exports.uploadFileHandler = uploadFileHandler;
/**
 * Get files for a request
 */
const getFiles = async (req, res) => {
    try {
        const requestId = req.params.id;
        const userId = req.user.id;
        const files = await fileService.getFiles(requestId, userId);
        res.json({ success: true, data: files });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.getFiles = getFiles;
/**
 * Delete a file
 */
const deleteFile = async (req, res) => {
    try {
        const fileId = req.params.fileId;
        const consultantUserId = req.user.id;
        await fileService.deleteFile(fileId, consultantUserId);
        res.json({ success: true, message: 'File deleted successfully' });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.deleteFile = deleteFile;
