"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFile = exports.getFiles = exports.uploadFile = void 0;
const client_1 = require("../../../../prisma/generated/client");
const prisma = new client_1.PrismaClient();
/**
 * Upload file for a consultation request
 */
const uploadFile = async (requestId, consultantUserId, fileData) => {
    // Verify consultant owns this request
    const request = await prisma.consultationRequest.findUnique({
        where: { id: requestId },
        include: {
            consultant: {
                select: { userId: true }
            }
        }
    });
    if (!request) {
        throw new Error('Consultation request not found');
    }
    if (request.consultant.userId !== consultantUserId) {
        throw new Error('Unauthorized: Only the consultant can upload files');
    }
    // Create file record
    return await prisma.sessionFile.create({
        data: {
            requestId,
            uploadedBy: consultantUserId,
            fileName: fileData.fileName,
            fileUrl: fileData.fileUrl,
            fileSize: fileData.fileSize,
            mimeType: fileData.mimeType,
            description: fileData.description
        }
    });
};
exports.uploadFile = uploadFile;
/**
 * Get files for a consultation request
 */
const getFiles = async (requestId, userId) => {
    // Verify user is either client or consultant
    const request = await prisma.consultationRequest.findUnique({
        where: { id: requestId },
        include: {
            consultant: {
                select: { userId: true }
            }
        }
    });
    if (!request) {
        throw new Error('Consultation request not found');
    }
    const isClient = request.clientId === userId;
    const isConsultant = request.consultant.userId === userId;
    if (!isClient && !isConsultant) {
        throw new Error('Unauthorized to view files');
    }
    return await prisma.sessionFile.findMany({
        where: { requestId },
        orderBy: { createdAt: 'desc' },
        include: {
            uploader: {
                select: {
                    fullName: true
                }
            }
        }
    });
};
exports.getFiles = getFiles;
/**
 * Delete a file
 */
const deleteFile = async (fileId, consultantUserId) => {
    const file = await prisma.sessionFile.findUnique({
        where: { id: fileId }
    });
    if (!file) {
        throw new Error('File not found');
    }
    if (file.uploadedBy !== consultantUserId) {
        throw new Error('Unauthorized: Only the uploader can delete this file');
    }
    return await prisma.sessionFile.delete({
        where: { id: fileId }
    });
};
exports.deleteFile = deleteFile;
