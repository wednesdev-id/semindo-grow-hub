import { prisma } from '../../../lib/prisma';
import { Prisma } from '@prisma/client';

export class MentoringService {
    // Service for managing mentoring sessions
    async createSession(data: {
        umkmProfileId: string;
        mentorId: string;
        date: Date;
        topic: string;
        notes?: string;
        nextAction?: string;
        tags?: string[];
        attachments?: any;
    }) {
        return prisma.mentoringSession.create({
            data: {
                ...data,
                status: 'done', // Default to done as usually logged after session
            },
        });
    }

    async getSessionsByUMKM(umkmProfileId: string) {
        return prisma.mentoringSession.findMany({
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

    async getSessionsByMentor(mentorId: string) {
        return prisma.mentoringSession.findMany({
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

    async updateSession(id: string, data: Prisma.MentoringSessionUpdateInput) {
        return prisma.mentoringSession.update({
            where: { id },
            data,
        });
    }
}
