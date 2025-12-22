import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Upload file for a consultation request
 */
export const uploadFile = async (
    requestId: string,
    consultantUserId: string,
    fileData: {
        fileName: string;
        fileUrl: string;
        fileSize?: number;
        mimeType?: string;
        description?: string;
    }
) => {
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

/**
 * Get files for a consultation request
 */
export const getFiles = async (requestId: string, userId: string) => {
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

/**
 * Delete a file
 */
export const deleteFile = async (fileId: string, consultantUserId: string) => {
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
