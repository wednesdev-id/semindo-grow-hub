"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentController = void 0;
const document_service_1 = require("../services/document.service");
const documentService = new document_service_1.DocumentService();
class DocumentController {
    async upload(req, res) {
        try {
            const userId = req.user.userId;
            const file = req.file;
            const { type, number } = req.body;
            if (!file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }
            if (!type) {
                return res.status(400).json({ message: 'Document type is required' });
            }
            const document = await documentService.uploadDocument(userId, file, type, number);
            res.status(201).json({ data: document });
        }
        catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({ message: error.message || 'Failed to upload document' });
        }
    }
    async list(req, res) {
        try {
            const userId = req.user.userId;
            const documents = await documentService.getDocuments(userId);
            res.json({ data: documents });
        }
        catch (error) {
            res.status(500).json({ message: error.message || 'Failed to fetch documents' });
        }
    }
    async delete(req, res) {
        try {
            const userId = req.user.userId;
            const { id } = req.params;
            await documentService.deleteDocument(id, userId);
            res.json({ message: 'Document deleted successfully' });
        }
        catch (error) {
            res.status(500).json({ message: error.message || 'Failed to delete document' });
        }
    }
}
exports.DocumentController = DocumentController;
