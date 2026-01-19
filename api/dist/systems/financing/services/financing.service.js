"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinancingService = void 0;
const db_1 = require("../../utils/db");
class FinancingService {
    async getPartners() {
        return db_1.db.financingPartner.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' },
        });
    }
    async getPartnerBySlug(slug) {
        return db_1.db.financingPartner.findUnique({
            where: { slug },
        });
    }
    async createApplication(userId, data) {
        return db_1.db.loanApplication.create({
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
    async getMyApplications(userId) {
        return db_1.db.loanApplication.findMany({
            where: { userId },
            include: {
                partner: true,
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async getApplicationById(id) {
        return db_1.db.loanApplication.findUnique({
            where: { id },
            include: {
                partner: true,
                documents: true,
            },
        });
    }
}
exports.FinancingService = FinancingService;
