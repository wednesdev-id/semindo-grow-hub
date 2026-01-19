"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceController = void 0;
class ResourceController {
    async upload(req, res) {
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
exports.ResourceController = ResourceController;
