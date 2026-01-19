"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentService = void 0;
const db_1 = require("../../utils/db");
class DocumentService {
    async uploadDocument(userId, file, type, number) {
        // Find UMKM Profile
        const umkmProfile = await db_1.db.uMKMProfile.findUnique({
            where: { userId }
        });
        if (!umkmProfile) {
            throw new Error('UMKM Profile not found');
        }
        // Create Document Record
        // In a real app, we would upload to S3/GCS here and get the URL.
        // For MVP, we'll assume the file is served locally.
        const fileUrl = `/uploads/${file.filename}`;
        return db_1.db.document.create({
            data: {
                umkmProfileId: umkmProfile.id,
                type,
                number,
                fileUrl,
                fileName: file.originalname,
                fileSize: file.size,
                mimeType: file.mimetype,
                status: 'pending'
            }
        });
    }
    async getDocuments(userId) {
        const umkmProfile = await db_1.db.uMKMProfile.findUnique({
            where: { userId }
        });
        if (!umkmProfile) {
            throw new Error('UMKM Profile not found');
        }
        return db_1.db.document.findMany({
            where: { umkmProfileId: umkmProfile.id },
            orderBy: { createdAt: 'desc' }
        });
    }
    async deleteDocument(id, userId) {
        const document = await db_1.db.document.findUnique({
            where: { id },
            include: { umkmProfile: true }
        });
        if (!document) {
            throw new Error('Document not found');
        }
        if (document.umkmProfile?.userId !== userId) {
            throw new Error('Unauthorized');
        }
        // In a real app, delete file from storage here
        return db_1.db.document.delete({
            where: { id }
        });
    }
}
exports.DocumentService = DocumentService;
