import { prisma } from '../../../lib/prisma';
import { Prisma } from '../../../../prisma/generated/client';

export class DocumentService {
    async uploadDocument(data: {
        umkmProfileId: string;
        type: string;
        fileUrl: string;
        fileName: string;
        fileSize?: number;
        mimeType?: string;
        number?: string;
        expiryDate?: Date;
    }) {
        return prisma.document.create({
            data: {
                ...data,
                status: 'pending',
            } as any, // Type cast needed due to optional fields mismatch in strict mode
        });
    }

    async verifyDocument(id: string, verifierId: string, status: 'verified' | 'rejected', reason?: string) {
        return prisma.document.update({
            where: { id },
            data: {
                status,
                verifiedBy: verifierId,
                verifiedAt: new Date(),
                rejectionReason: reason,
            },
        });
    }

    async getDocumentsByUMKM(umkmProfileId: string) {
        return prisma.document.findMany({
            where: { umkmProfileId },
            orderBy: { createdAt: 'desc' },
        });
    }

    async deleteDocument(id: string) {
        return prisma.document.delete({
            where: { id },
        });
    }
}
