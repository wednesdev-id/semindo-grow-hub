/**
 * Letter Subject Service
 * Handles letter subjects (perihal surat)
 */

import { prisma } from '../../../lib/prisma';
import {
    CreateLetterSubjectDto,
    UpdateLetterSubjectDto,
    LetterSubjectFilters,
} from '../types';

/**
 * Create letter subject
 */
export const createLetterSubject = async (data: CreateLetterSubjectDto) => {
    // Check if code exists
    const existing = await prisma.letterSubject.findUnique({
        where: { code: data.code },
    });

    if (existing) {
        throw new Error('Kode perihal sudah terdaftar');
    }

    const subject = await prisma.letterSubject.create({
        data,
    });

    return subject;
};

/**
 * List letter subjects
 */
export const listLetterSubjects = async (filters: LetterSubjectFilters) => {
    const where: any = {};
    const page = filters.page || 1;
    const limit = filters.limit || 50;
    const skip = (page - 1) * limit;

    if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
    }

    if (filters.search) {
        where.OR = [
            { code: { contains: filters.search, mode: 'insensitive' } },
            { name: { contains: filters.search, mode: 'insensitive' } },
        ];
    }

    const total = await prisma.letterSubject.count({ where });

    const subjects = await prisma.letterSubject.findMany({
        where,
        orderBy: { name: 'asc' },
        skip,
        take: limit,
    });

    return {
        data: subjects,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
        },
    };
};

/**
 * Update letter subject
 */
export const updateLetterSubject = async (id: string, data: UpdateLetterSubjectDto) => {
    const subject = await prisma.letterSubject.update({
        where: { id },
        data,
    });

    return subject;
};

/**
 * Delete letter subject
 */
export const deleteLetterSubject = async (id: string) => {
    await prisma.letterSubject.delete({
        where: { id },
    });

    return { message: 'Perihal surat berhasil dihapus' };
};
