import { db } from '../../utils/db';
import { FinancingPartner, LoanApplication, Prisma } from '../../../../prisma/generated/client';

export class FinancingService {
    async getPartners() {
        return db.financingPartner.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
        });
    }

    async getPartnerBySlug(slug: string) {
        return db.financingPartner.findUnique({
            where: { slug },
        });
    }

    async createApplication(userId: string, data: {
        partnerId: string;
        amount: number;
        term: number;
        purpose: string;
        notes?: string;
    }) {
        return db.loanApplication.create({
            data: {
                userId,
                partnerId: data.partnerId,
                amount: data.amount,
                term: data.term,
                purpose: data.purpose,
                notes: data.notes,
                status: 'submitted',
            },
        });
    }

    async getMyApplications(userId: string) {
        return db.loanApplication.findMany({
            where: { userId },
            include: {
                partner: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }

    async getApplicationById(id: string) {
        return db.loanApplication.findUnique({
            where: { id },
            include: {
                partner: true,
                documents: true,
            },
        });
    }
}
