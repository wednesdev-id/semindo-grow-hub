/**
 * Archive Service
 * Handles archiving of letters (arsip digital)
 */

import { prisma } from '../../../lib/prisma';
import { generateArchiveNumber } from './letter-number.service';
import {
  CreateArchiveDto,
  UpdateArchiveDto,
  ArchiveFilters,
} from '../types';

/**
 * Create archive from incoming letter
 */
export const archiveIncomingLetter = async (
  incomingLetterId: string,
  data: Omit<CreateArchiveDto, 'incomingLetterId' | 'outgoingLetterId' | 'letterNumber' | 'subject'>
) => {
  // Get incoming letter
  const letter = await prisma.incomingLetter.findUnique({
    where: { id: incomingLetterId },
    include: { category: true },
  });

  if (!letter) {
    throw new Error('Surat masuk tidak ditemukan');
  }

  // Check if already archived
  const existingArchive = await prisma.archive.findUnique({
    where: { incomingLetterId },
  });

  if (existingArchive) {
    throw new Error('Surat sudah diarsipkan');
  }

  // Generate archive number
  const archiveNumber = await generateArchiveNumber(
    'MASUK',
    data.archiveYear,
    data.archiveMonth
  );

  // Create archive
  const archive = await prisma.archive.create({
    data: {
      archiveNumber,
      letterType: 'MASUK',
      incomingLetterId,
      letterNumber: letter.letterNumber,
      subject: letter.subject,
      categoryId: data.categoryId || letter.categoryId,
      archiveYear: data.archiveYear,
      archiveMonth: data.archiveMonth,
      location: data.location,
      protectionLevel: data.protectionLevel,
      activeRetention: data.activeRetention,
      inactiveRetention: data.inactiveRetention,
      disposalDate: data.disposalDate,
      notes: data.notes,
      createdBy: data.createdBy,
    },
    include: {
      incomingLetter: {
        include: {
          category: true,
          creator: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      },
      category: true,
    },
  });

  // Update letter status
  await prisma.incomingLetter.update({
    where: { id: incomingLetterId },
    data: {
      status: 'ARSIP',
      archivedAt: new Date(),
    },
  });

  return archive;
};

/**
 * Create archive from outgoing letter
 */
export const archiveOutgoingLetter = async (
  outgoingLetterId: string,
  data: Omit<CreateArchiveDto, 'incomingLetterId' | 'outgoingLetterId' | 'letterNumber' | 'subject'>
) => {
  // Get outgoing letter
  const letter = await prisma.outgoingLetter.findUnique({
    where: { id: outgoingLetterId },
    include: { category: true },
  });

  if (!letter) {
    throw new Error('Surat keluar tidak ditemukan');
  }

  if (!letter.letterNumber) {
    throw new Error('Surat belum diterbitkan');
  }

  // Check if already archived
  const existingArchive = await prisma.archive.findUnique({
    where: { outgoingLetterId },
  });

  if (existingArchive) {
    throw new Error('Surat sudah diarsipkan');
  }

  // Generate archive number
  const archiveNumber = await generateArchiveNumber(
    'KELUAR',
    data.archiveYear,
    data.archiveMonth
  );

  // Create archive
  const archive = await prisma.archive.create({
    data: {
      archiveNumber,
      letterType: 'KELUAR',
      outgoingLetterId,
      letterNumber: letter.letterNumber,
      subject: letter.subject,
      categoryId: data.categoryId || letter.categoryId,
      archiveYear: data.archiveYear,
      archiveMonth: data.archiveMonth,
      location: data.location,
      protectionLevel: data.protectionLevel,
      activeRetention: data.activeRetention,
      inactiveRetention: data.inactiveRetention,
      disposalDate: data.disposalDate,
      notes: data.notes,
      createdBy: data.createdBy,
    },
    include: {
      outgoingLetter: {
        include: {
          category: true,
          creator: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      },
      category: true,
    },
  });

  // Update letter status
  await prisma.outgoingLetter.update({
    where: { id: outgoingLetterId },
    data: {
      status: 'ARSIP',
      archivedAt: new Date(),
    },
  });

  return archive;
};

/**
 * List archives with filters
 */
export const listArchives = async (filters: ArchiveFilters) => {
  const where: any = { deletedAt: null };
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  // Apply filters
  if (filters.letterType) {
    where.letterType = filters.letterType;
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.archiveYear) {
    where.archiveYear = filters.archiveYear;
  }

  if (filters.archiveMonth) {
    where.archiveMonth = filters.archiveMonth;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.protectionLevel) {
    where.protectionLevel = filters.protectionLevel;
  }

  if (filters.search) {
    where.OR = [
      { archiveNumber: { contains: filters.search, mode: 'insensitive' } },
      { letterNumber: { contains: filters.search, mode: 'insensitive' } },
      { subject: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  // Get total count
  const total = await prisma.archive.count({ where });

  // Get archives
  const archives = await prisma.archive.findMany({
    where,
    include: {
      category: true,
      incomingLetter: {
        select: {
          letterNumber: true,
          letterDate: true,
          sender: true,
          fileUrl: true,
        },
      },
      outgoingLetter: {
        select: {
          letterNumber: true,
          letterDate: true,
          recipient: true,
          fileUrl: true,
        },
      },
      creator: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
    orderBy: [
      { archiveYear: 'desc' },
      { archiveMonth: 'desc' },
      { createdAt: 'desc' },
    ],
    skip,
    take: limit,
  });

  return {
    data: archives,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get archive by ID
 */
export const getArchiveById = async (id: string) => {
  const archive = await prisma.archive.findUnique({
    where: { id, deletedAt: null },
    include: {
      category: true,
      incomingLetter: {
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
          },
        },
      },
      outgoingLetter: {
        include: {
          category: true,
          creator: {
            select: {
              id: true,
              fullName: true,
              profilePictureUrl: true,
            },
          },
          approvals: {
            include: {
              user: {
                select: {
                  id: true,
                  fullName: true,
                },
              },
            },
          },
        },
      },
      creator: {
        select: {
          id: true,
          fullName: true,
          profilePictureUrl: true,
        },
      },
    },
  });

  if (!archive) {
    throw new Error('Arsip tidak ditemukan');
  }

  return archive;
};

/**
 * Update archive
 */
export const updateArchive = async (id: string, data: UpdateArchiveDto) => {
  const archive = await prisma.archive.update({
    where: { id },
    data,
    include: {
      category: true,
      incomingLetter: true,
      outgoingLetter: true,
    },
  });

  return archive;
};

/**
 * Soft delete archive
 */
export const deleteArchive = async (id: string) => {
  const archive = await prisma.archive.update({
    where: { id },
    data: {
      status: 'MUSNAH',
      deletedAt: new Date(),
    },
  });

  return { message: 'Arsip berhasil dihapus', archive };
};

/**
 * Get archive statistics
 */
export const getArchiveStats = async () => {
  const total = await prisma.archive.count({
    where: { deletedAt: null },
  });
  const aktif = await prisma.archive.count({
    where: { status: 'AKTIF', deletedAt: null },
  });
  const inaktif = await prisma.archive.count({
    where: { status: 'INAKTIF', deletedAt: null },
  });

  // Count by type
  const masuk = await prisma.archive.count({
    where: { letterType: 'MASUK', deletedAt: null },
  });
  const keluar = await prisma.archive.count({
    where: { letterType: 'KELUAR', deletedAt: null },
  });

  return {
    total,
    aktif,
    inaktif,
    masuk,
    keluar,
  };
};

/**
 * Get archives by year/month
 */
export const getArchivesByPeriod = async (year: number, month?: number) => {
  const where: any = {
    archiveYear: year,
    deletedAt: null,
  };

  if (month) {
    where.archiveMonth = month;
  }

  const archives = await prisma.archive.findMany({
    where,
    include: {
      category: true,
      incomingLetter: {
        select: {
          letterNumber: true,
          letterDate: true,
          sender: true,
        },
      },
      outgoingLetter: {
        select: {
          letterNumber: true,
          letterDate: true,
          recipient: true,
        },
      },
    },
    orderBy: [
      { archiveMonth: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  return archives;
};

/**
 * Get disposal candidates (archives past retention period)
 */
export const getDisposalCandidates = async () => {
  const archives = await prisma.archive.findMany({
    where: {
      disposalDate: {
        lte: new Date(),
      },
      status: {
        in: ['AKTIF', 'INAKTIF'],
      },
      deletedAt: null,
    },
    include: {
      category: true,
    },
    orderBy: { disposalDate: 'asc' },
  });

  return archives;
};
