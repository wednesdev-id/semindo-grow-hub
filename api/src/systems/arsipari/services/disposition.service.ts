/**
 * Disposition Service
 * Handles letter disposition (disposisi surat)
 */

import { prisma } from '../../../lib/prisma';
import { CreateDispositionDto, UpdateDispositionDto, DispositionFilters } from '../types';

/**
 * Create disposition
 */
export const createDisposition = async (data: CreateDispositionDto, fromUserId: string) => {
  // Check if incoming letter exists
  const letter = await prisma.incomingLetter.findUnique({
    where: { id: data.incomingLetterId },
  });

  if (!letter) {
    throw new Error('Surat masuk tidak ditemukan');
  }

  // Check if toUser exists
  const toUser = await prisma.user.findUnique({
    where: { id: data.toUserId },
  });

  if (!toUser) {
    throw new Error('User tujuan tidak ditemukan');
  }

  // Create disposition
  const disposition = await prisma.disposition.create({
    data: {
      incomingLetterId: data.incomingLetterId,
      fromUserId,
      toUserId: data.toUserId,
      instruction: data.instruction,
      notes: data.notes,
      status: 'AWAITING',
    },
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
      incomingLetter: {
        select: {
          id: true,
          letterNumber: true,
          subject: true,
        },
      },
    },
  });

  // Update letter status
  await prisma.incomingLetter.update({
    where: { id: data.incomingLetterId },
    data: { status: 'DISPOSISI' },
  });

  return disposition;
};

/**
 * List dispositions with filters
 */
export const listDispositions = async (filters: DispositionFilters, userId?: string) => {
  const where: any = {};
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  // If userId provided, only show dispositions for/from this user
  if (userId) {
    where.OR = [{ fromUserId: userId }, { toUserId: userId }];
  }

  // Apply filters
  if (filters.incomingLetterId) {
    where.incomingLetterId = filters.incomingLetterId;
  }

  if (filters.fromUserId) {
    where.fromUserId = filters.fromUserId;
  }

  if (filters.toUserId) {
    where.toUserId = filters.toUserId;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.startDate || filters.endDate) {
    where.createdAt = {};
    if (filters.startDate) {
      where.createdAt.gte = filters.startDate;
    }
    if (filters.endDate) {
      where.createdAt.lte = filters.endDate;
    }
  }

  // Get total count
  const total = await prisma.disposition.count({ where });

  // Get dispositions
  const dispositions = await prisma.disposition.findMany({
    where,
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
      incomingLetter: {
        select: {
          id: true,
          letterNumber: true,
          subject: true,
          priority: true,
          fileUrl: true,
          mimeType: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit,
  });

  return {
    data: dispositions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get disposition by ID
 */
export const getDispositionById = async (id: string) => {
  const disposition = await prisma.disposition.findUnique({
    where: { id },
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
        // We can't select specific fields if we use include above without strict typing
        // But since we are inside include: incomingLetter, we actually can't mix select and include easily in Prisma unless we select specifically.
        // Wait, the previous code used `include: { category: true... }`.
        // To add fileUrl, we assume the whole object IncomingLetter is returned, which typically INCLUDES all scalars (like fileUrl).
        // So `fileUrl` SHOULD ALREADY be there if we include `incomingLetter`.
        // Let's verify if `fileUrl` is being stripped or if `incomingLetter` is fully returned.
        // Prisma `include` returns ALL scalar fields of the relation.
        // So `fileUrl` SHOULD be present unless explicitly excluded (which Prisma doesn't do by default).

        // However, let's look at listDispositions. There we used `select`.
        // Here we use `include`.
        // If `include` is used, all scalars (id, letterNumber, fileUrl, mimeType...) are returned.
        // So backend `getDispositionById` SHOULD be correct already.

        // Wait, let's look at the actual code in file.
        // incomingLetter: { include: { category: true, creator: ... } }
        // Yes, this means all IncomingLetter scalars are included.

        // So why is it missing?
        // Maybe the user's local FE state is from `listDispositions` which WAS missing it until recently?
        // And they didn't reload?

        // I'll leave this file alone if I am confident `include` returns scalars.
        // Yes, `include` returns all scalars.

        // I will focus on the Frontend `DispositionsPage.tsx` to FORCE fetch the detail. 

      },
    },
  });

  if (!disposition) {
    throw new Error('Disposisi tidak ditemukan');
  }

  return disposition;
};

/**
 * Update disposition status (mark as read/completed)
 */
export const updateDisposition = async (id: string, data: UpdateDispositionDto, userId: string) => {
  const disposition = await prisma.disposition.findUnique({
    where: { id },
  });

  if (!disposition) {
    throw new Error('Disposisi tidak ditemukan');
  }

  // Fetch acting user to check roles
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      userRoles: {
        include: {
          role: true
        }
      }
    }
  });

  if (!user) {
    throw new Error('User tidak ditemukan');
  }

  const isSuperAdmin = user.userRoles.some(ur => ['super_admin', 'admin'].includes(ur.role.name));
  const isRecipient = disposition.toUserId === userId;

  // Only recipient or Super Admin can update disposition
  if (!isRecipient && !isSuperAdmin) {
    throw new Error('Anda tidak berhak mengupdate disposisi ini');
  }

  const updateData: any = {
    notes: data.notes,
  };

  if (data.status === 'READ') {
    updateData.readAt = new Date();
  } else if (data.status === 'COMPLETED') {
    updateData.completedAt = new Date();
  }

  const updated = await prisma.disposition.update({
    where: { id },
    data: {
      status: data.status,
      ...updateData,
    },
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
  });

  return updated;
};

/**
 * Delete disposition
 */
export const deleteDisposition = async (id: string, userId: string) => {
  const disposition = await prisma.disposition.findUnique({
    where: { id },
  });

  if (!disposition) {
    throw new Error('Disposisi tidak ditemukan');
  }

  // Only fromUser can delete disposition
  if (disposition.fromUserId !== userId) {
    throw new Error('Anda tidak berhak menghapus disposisi ini');
  }

  await prisma.disposition.delete({
    where: { id },
  });

  return { message: 'Disposisi berhasil dihapus' };
};

/**
 * Get pending dispositions count for user
 */
export const getPendingDispositionsCount = async (userId: string) => {
  const count = await prisma.disposition.count({
    where: {
      toUserId: userId,
      status: 'AWAITING',
    },
  });

  return count;
};

/**
 * Get disposition chain for incoming letter
 */
export const getDispositionChain = async (incomingLetterId: string) => {
  const dispositions = await prisma.disposition.findMany({
    where: {
      incomingLetterId,
    },
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
    orderBy: { createdAt: 'asc' },
  });

  return dispositions;
};
