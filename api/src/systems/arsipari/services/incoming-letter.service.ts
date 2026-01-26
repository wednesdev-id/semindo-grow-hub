/**
 * Incoming Letter Service
 * Handles business logic for incoming letters (surat masuk)
 */

import { prisma } from '../../../lib/prisma';
import {
  CreateIncomingLetterDto,
  UpdateIncomingLetterDto,
  IncomingLetterFilters,
} from '../types';

/**
 * Create incoming letter
 */
export const createIncomingLetter = async (data: CreateIncomingLetterDto) => {
  // Check if letter number already exists
  const existing = await prisma.incomingLetter.findUnique({
    where: { letterNumber: data.letterNumber },
  });

  if (existing) {
    throw new Error('Nomor surat sudah terdaftar');
  }

  // Create incoming letter
  const letter = await prisma.incomingLetter.create({
    data: {
      letterNumber: data.letterNumber,
      letterDate: data.letterDate,
      receivedDate: data.receivedDate,
      sender: data.sender,
      senderAddress: data.senderAddress,
      subject: data.subject,
      categoryId: data.categoryId || null,
      classification: data.classification || 'BIASA',
      nature: data.nature || 'BIASA',
      priority: data.priority || 'NORMAL',
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
      notes: data.notes,
      createdBy: data.createdBy,
      status: 'BARU',
    },
    include: {
      category: true,
      creator: {
        select: {
          id: true,
          fullName: true,
          profilePictureUrl: true,
        },
      },
    },
  });

  return letter;
};

/**
 * List incoming letters with filters
 */
export const listIncomingLetters = async (filters: IncomingLetterFilters) => {
  const where: any = {};
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  // Apply filters
  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.priority) {
    where.priority = filters.priority;
  }

  if (filters.classification) {
    where.classification = filters.classification;
  }

  if (filters.startDate || filters.endDate) {
    where.letterDate = {};
    if (filters.startDate) {
      where.letterDate.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.letterDate.lte = filters.endDate;
    }
  }

  if (filters.search) {
    where.OR = [
      { letterNumber: { contains: filters.search, mode: 'insensitive' } },
      { sender: { contains: filters.search, mode: 'insensitive' } },
      { subject: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  // Get total count
  const total = await prisma.incomingLetter.count({ where });

  // Get letters
  const letters = await prisma.incomingLetter.findMany({
    where,
    include: {
      category: true,
      creator: {
        select: {
          id: true,
          fullName: true,
          profilePictureUrl: true,
        },
      },
      dispositions: {
        include: {
          fromUser: {
            select: {
              id: true,
              fullName: true,
            },
          },
          toUser: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
    orderBy: [
      { priority: 'desc' },
      { receivedDate: 'desc' },
    ],
    skip,
    take: limit,
  });

  return {
    data: letters,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get incoming letter by ID
 */
export const getIncomingLetterById = async (id: string) => {
  const letter = await prisma.incomingLetter.findUnique({
    where: { id },
    include: {
      category: true,
      creator: {
        select: {
          id: true,
          fullName: true,
          profilePictureUrl: true,
        },
      },
      dispositions: {
        include: {
          fromUser: {
            select: {
              id: true,
              fullName: true,
              profilePictureUrl: true,
            },
          },
          toUser: {
            select: {
              id: true,
              fullName: true,
              profilePictureUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!letter) {
    throw new Error('Surat masuk tidak ditemukan');
  }

  return letter;
};

/**
 * Update incoming letter
 */
export const updateIncomingLetter = async (id: string, data: UpdateIncomingLetterDto) => {
  // Check if letter exists
  const existing = await prisma.incomingLetter.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error('Surat masuk tidak ditemukan');
  }

  // If updating letter number, check for duplicates
  if (data.letterNumber && data.letterNumber !== existing.letterNumber) {
    const duplicate = await prisma.incomingLetter.findUnique({
      where: { letterNumber: data.letterNumber },
    });

    if (duplicate) {
      throw new Error('Nomor surat sudah terdaftar');
    }
  }

  // Update letter
  const letter = await prisma.incomingLetter.update({
    where: { id },
    data: {
      letterNumber: data.letterNumber,
      letterDate: data.letterDate,
      receivedDate: data.receivedDate,
      sender: data.sender,
      senderAddress: data.senderAddress,
      subject: data.subject,
      categoryId: data.categoryId || null,
      classification: data.classification,
      nature: data.nature,
      priority: data.priority,
      fileUrl: data.fileUrl,
      fileName: data.fileName,
      fileSize: data.fileSize,
      mimeType: data.mimeType,
      status: data.status,
      notes: data.notes,
    },
    include: {
      category: true,
      creator: {
        select: {
          id: true,
          fullName: true,
          profilePictureUrl: true,
        },
      },
    },
  });

  return letter;
};

/**
 * Update incoming letter status
 */
export const updateIncomingLetterStatus = async (
  id: string,
  status: string,
  notes?: string
) => {
  const letter = await prisma.incomingLetter.update({
    where: { id },
    data: {
      status,
      notes: notes || undefined,
      ...(status === 'SELESAI' && { finishedAt: new Date() }),
    },
  });

  return letter;
};

/**
 * Delete incoming letter
 */
export const deleteIncomingLetter = async (id: string) => {
  // Check if letter exists
  const letter = await prisma.incomingLetter.findUnique({
    where: { id },
  });

  if (!letter) {
    throw new Error('Surat masuk tidak ditemukan');
  }

  // Check if letter has archive
  if (letter.status === 'ARSIP') {
    throw new Error('Surat sudah diarsipkan, tidak dapat dihapus');
  }

  // Delete letter
  await prisma.incomingLetter.delete({
    where: { id },
  });

  return { message: 'Surat masuk berhasil dihapus' };
};

/**
 * Get statistics
 */
export const getIncomingLetterStats = async () => {
  const total = await prisma.incomingLetter.count();
  const baru = await prisma.incomingLetter.count({ where: { status: 'BARU' } });
  const diproses = await prisma.incomingLetter.count({ where: { status: 'DIPROSES' } });
  const disposisi = await prisma.incomingLetter.count({ where: { status: 'DISPOSISI' } });
  const selesai = await prisma.incomingLetter.count({ where: { status: 'SELESAI' } });
  const arsip = await prisma.incomingLetter.count({ where: { status: 'ARSIP' } });

  return {
    total,
    baru,
    diproses,
    disposisi,
    selesai,
    arsip,
  };
};
