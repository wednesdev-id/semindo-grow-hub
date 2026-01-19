"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MentoringService = void 0;
const prisma_1 = require("../../../lib/prisma");
class MentoringService {
    // Service for managing mentoring sessions
    async createSession(data) {
        return prisma_1.prisma.mentoringSession.create({
            data: {
                ...data,
                status: 'done', // Default to done as usually logged after session
            },
        });
    }
    async getSessionsByUMKM(umkmProfileId) {
        return prisma_1.prisma.mentoringSession.findMany({
            where: { umkmProfileId },
            include: {
                mentor: {
                    include: {
                        user: {
                            select: { fullName: true, email: true },
                        },
                    },
                },
            },
            orderBy: { date: 'desc' },
        });
    }
    async getSessionsByMentor(mentorId) {
        return prisma_1.prisma.mentoringSession.findMany({
            where: { mentorId },
            include: {
                umkmProfile: {
                    select: {
                        businessName: true,
                        ownerName: true,
                    },
                },
            },
            orderBy: { date: 'desc' },
        });
    }
    async updateSession(id, data) {
        return prisma_1.prisma.mentoringSession.update({
            where: { id },
            data,
        });
    }
}
exports.MentoringService = MentoringService;
