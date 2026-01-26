/**
 * Outgoing Letter Service
 * Handles business logic for outgoing letters (surat keluar) with approval workflow
 */

import { prisma } from '../../../lib/prisma';
import { generateLetterNumber, parseNumberFormat } from './letter-number.service';
import {
  CreateOutgoingLetterDto,
  UpdateOutgoingLetterDto,
  OutgoingLetterFilters,
  SubmitApprovalDto,
  ApproveLetterDto,
} from '../types';

/**
 * Create outgoing letter (draft)
 */
export const createOutgoingLetter = async (data: CreateOutgoingLetterDto) => {
  const letter = await prisma.outgoingLetter.create({
    data: {
      templateId: data.templateId || null,
      recipient: data.recipient,
      recipientAddress: data.recipientAddress,
      subject: data.subject,
      content: data.content,
      attachment: data.attachment,
      letterDate: data.letterDate,
      categoryId: data.categoryId || null,
      notes: data.notes,
      createdBy: data.createdBy,
      status: 'DRAFT',
    },
    include: {
      template: true,
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
 * List outgoing letters with filters
 */
export const listOutgoingLetters = async (filters: OutgoingLetterFilters) => {
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

  if (filters.templateId) {
    where.templateId = filters.templateId;
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

  if (filters.search) {
    where.OR = [
      { letterNumber: { contains: filters.search, mode: 'insensitive' } },
      { recipient: { contains: filters.search, mode: 'insensitive' } },
      { subject: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  // Get total count
  const total = await prisma.outgoingLetter.count({ where });

  // Get letters
  const letters = await prisma.outgoingLetter.findMany({
    where,
    include: {
      template: true,
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
              profilePictureUrl: true,
            },
          },
        },
        orderBy: [{ sequence: 'asc' }],
      },
    },
    orderBy: { createdAt: 'desc' },
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
 * Get outgoing letter by ID
 */
export const getOutgoingLetterById = async (id: string) => {
  const letter = await prisma.outgoingLetter.findUnique({
    where: { id },
    include: {
      template: {
        include: {
          letterhead: true,
        },
      },
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
              profilePictureUrl: true,
            },
          },
        },
        orderBy: [{ sequence: 'asc' }],
      },
    },
  });

  if (!letter) {
    throw new Error('Surat keluar tidak ditemukan');
  }

  return letter;
};

/**
 * Update outgoing letter
 */
export const updateOutgoingLetter = async (id: string, data: UpdateOutgoingLetterDto) => {
  const existing = await prisma.outgoingLetter.findUnique({
    where: { id },
  });

  if (!existing) {
    throw new Error('Surat keluar tidak ditemukan');
  }

  // Only allow update if status is DRAFT or REJECTED
  if (existing.status === 'APPROVED' || existing.status === 'PUBLISHED') {
    throw new Error('Surat sudah disetujui atau diterbitkan, tidak dapat diubah');
  }

  const letter = await prisma.outgoingLetter.update({
    where: { id },
    data: {
      templateId: data.templateId || null,
      recipient: data.recipient,
      recipientAddress: data.recipientAddress,
      subject: data.subject,
      content: data.content,
      attachment: data.attachment,
      letterDate: data.letterDate,
      categoryId: data.categoryId || null,
      notes: data.notes,
      ...(data.status && { status: data.status }),
    },
    include: {
      template: true,
      category: true,
    },
  });

  return letter;
};

/**
 * Submit for approval
 */
export const submitForApproval = async (id: string, data: SubmitApprovalDto) => {
  const letter = await prisma.outgoingLetter.findUnique({
    where: { id },
    include: {
      approvals: true,
    },
  });

  if (!letter) {
    throw new Error('Surat keluar tidak ditemukan');
  }

  if (letter.status !== 'DRAFT' && letter.status !== 'REJECTED') {
    throw new Error('Hanya surat dengan status DRAFT atau REJECTED yang dapat diajukan');
  }

  // Create approval workflow
  const approvals = data.approvalUserIds.map((userId, index) => ({
    outgoingLetterId: id,
    userId,
    sequence: index + 1,
    status: index === 0 ? 'PENDING' : 'PENDING',
  }));

  await prisma.letterApproval.createMany({
    data: approvals,
  });

  // Update letter status
  const updated = await prisma.outgoingLetter.update({
    where: { id },
    data: {
      status: 'REVIEW',
    },
    include: {
      approvals: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
        orderBy: [{ sequence: 'asc' }],
      },
    },
  });

  return updated;
};

/**
 * Approve/Reject letter
 */
export const processApproval = async (letterId: string, approvalId: string, data: ApproveLetterDto, userId: string) => {
  // Get letter and approval
  const letter = await prisma.outgoingLetter.findUnique({
    where: { id: letterId },
    include: {
      approvals: {
        orderBy: [{ sequence: 'asc' }],
      },
    },
  });

  if (!letter) {
    throw new Error('Surat keluar tidak ditemukan');
  }

  const approval = letter.approvals.find((a) => a.id === approvalId);

  if (!approval) {
    throw new Error('Approval tidak ditemukan');
  }

  if (approval.userId !== userId) {
    throw new Error('Anda tidak berhak melakukan approval untuk surat ini');
  }

  if (approval.status !== 'PENDING') {
    throw new Error('Approval sudah diproses');
  }

  // Check if this is the next approval in sequence
  const pendingApprovals = letter.approvals.filter((a) => a.status === 'PENDING');
  if (pendingApprovals[0]?.id !== approvalId) {
    throw new Error('Approval harus dilakukan secara berurutan');
  }

  // Update approval
  const updatedApproval = await prisma.letterApproval.update({
    where: { id: approvalId },
    data: {
      status: data.status,
      notes: data.notes,
      approvalDate: new Date(),
    },
  });

  // Update letter status based on result
  if (data.status === 'REJECTED') {
    // If rejected, update all pending approvals to cancelled
    await prisma.letterApproval.updateMany({
      where: {
        outgoingLetterId: letterId,
        status: 'PENDING',
      },
      data: {
        status: 'CANCELLED',
      },
    });

    await prisma.outgoingLetter.update({
      where: { id: letterId },
      data: {
        status: 'REJECTED',
      },
    });
  } else {
    // Check if all approvals are approved
    const allApprovals = await prisma.letterApproval.findMany({
      where: { outgoingLetterId: letterId },
    });

    const allApproved = allApprovals.every((a) => a.status === 'APPROVED');

    if (allApproved) {
      await prisma.outgoingLetter.update({
        where: { id: letterId },
        data: {
          status: 'APPROVED',
        },
      });
    }
  }

  return updatedApproval;
};

/**
 * Publish letter (generate letter number)
 */
export const publishLetter = async (id: string, letterDate: Date, letterNumberOverride?: string) => {
  const letter = await prisma.outgoingLetter.findUnique({
    where: { id },
    include: {
      template: true,
      category: true,
    },
  });

  if (!letter) {
    throw new Error('Surat keluar tidak ditemukan');
  }

  if (letter.status !== 'APPROVED') {
    throw new Error('Surat harus disetujui terlebih dahulu');
  }

  // Generate letter number
  let letterNumber = letterNumberOverride;
  if (!letterNumber) {
    const numberFormat = parseNumberFormat(letter.template?.numberFormat);
    letterNumber = await generateLetterNumber('OUTGOING', {
      format: numberFormat,
      categoryCode: letter.category?.code,
      date: letterDate,
    });
  }

  // Check if letter number already exists
  const existing = await prisma.outgoingLetter.findUnique({
    where: { letterNumber },
  });

  if (existing) {
    throw new Error('Nomor surat sudah terdaftar');
  }

  // Update letter
  const published = await prisma.outgoingLetter.update({
    where: { id },
    data: {
      letterNumber,
      letterDate,
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
  });

  return { ...published, letterNumber };
};

/**
 * Delete outgoing letter
 */
export const deleteOutgoingLetter = async (id: string) => {
  const letter = await prisma.outgoingLetter.findUnique({
    where: { id },
  });

  if (!letter) {
    throw new Error('Surat keluar tidak ditemukan');
  }

  if (letter.status === 'APPROVED' || letter.status === 'PUBLISHED' || letter.status === 'ARSIP') {
    throw new Error('Surat tidak dapat dihapus');
  }

  await prisma.outgoingLetter.delete({
    where: { id },
  });

  return { message: 'Surat keluar berhasil dihapus' };
};

/**
 * Get statistics
 */
export const getOutgoingLetterStats = async () => {
  const total = await prisma.outgoingLetter.count();
  const draft = await prisma.outgoingLetter.count({ where: { status: 'DRAFT' } });
  const review = await prisma.outgoingLetter.count({ where: { status: 'REVIEW' } });
  const approved = await prisma.outgoingLetter.count({ where: { status: 'APPROVED' } });
  const published = await prisma.outgoingLetter.count({ where: { status: 'PUBLISHED' } });
  const rejected = await prisma.outgoingLetter.count({ where: { status: 'REJECTED' } });
  const arsip = await prisma.outgoingLetter.count({ where: { status: 'ARSIP' } });

  return {
    total,
    draft,
    review,
    approved,
    published,
    rejected,
    arsip,
  };
};
