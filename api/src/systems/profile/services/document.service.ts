import { db } from '../../utils/db';
import { Document } from '../../../../prisma/generated/client';

export class DocumentService {
    async uploadDocument(
        userId: string,
        file: Express.Multer.File,
        type: string,
        number?: string
    ) {
        // Find UMKM Profile (get first/primary profile since user can have multiple)
        const umkmProfile = await db.uMKMProfile.findFirst({
            where: { userId }
        });

        if (!umkmProfile) {
            throw new Error('UMKM Profile not found');
        }

        // Create Document Record
        // In a real app, we would upload to S3/GCS here and get the URL.
        // For MVP, we'll assume the file is served locally.
        const fileUrl = `/uploads/${file.filename}`;

        return db.document.create({
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

    async getDocuments(userId: string) {
        const umkmProfile = await db.uMKMProfile.findFirst({
            where: { userId }
        });

        if (!umkmProfile) {
            throw new Error('UMKM Profile not found');
        }

        return db.document.findMany({
            where: { umkmProfileId: umkmProfile.id },
            orderBy: { createdAt: 'desc' }
        });
    }

    async deleteDocument(id: string, userId: string) {
        const document = await db.document.findUnique({
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

        return db.document.delete({
            where: { id }
        });
    }
}
