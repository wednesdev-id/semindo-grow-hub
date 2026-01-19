"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentService = void 0;
const prisma_1 = require("../../../lib/prisma");
class DocumentService {
    async uploadDocument(data) {
        return prisma_1.prisma.document.create({
            data: {
                ...data,
                status: 'pending',
            }, // Type cast needed due to optional fields mismatch in strict mode
        });
    }
    async verifyDocument(id, verifierId, status, reason) {
        return prisma_1.prisma.document.update({
            where: { id },
            data: {
                status,
                verifiedBy: verifierId,
                verifiedAt: new Date(),
                rejectionReason: reason,
            },
        });
    }
    async getDocumentsByUMKM(umkmProfileId) {
        return prisma_1.prisma.document.findMany({
            where: { umkmProfileId },
            orderBy: { createdAt: 'desc' },
        });
    }
    async deleteDocument(id) {
        return prisma_1.prisma.document.delete({
            where: { id },
        });
    }
}
exports.DocumentService = DocumentService;
