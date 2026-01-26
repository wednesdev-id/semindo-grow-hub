/**
 * Template & Letterhead Service
 * Handles letter templates and letterheads (kop surat)
 */

import { prisma } from '../../../lib/prisma';
import {
  CreateLetterTemplateDto,
  UpdateLetterTemplateDto,
  LetterTemplateFilters,
  RenderTemplateDto,
  CreateLetterheadDto,
  UpdateLetterheadDto,
  LetterheadFilters,
  CreateLetterCategoryDto,
  UpdateLetterCategoryDto,
  LetterCategoryFilters,
} from '../types';

// ============================================
// LETTER CATEGORY
// ============================================

/**
 * Create letter category
 */
export const createLetterCategory = async (data: CreateLetterCategoryDto) => {
  // Check if code exists
  const existing = await prisma.letterCategory.findUnique({
    where: { code: data.code },
  });

  if (existing) {
    throw new Error('Kode kategori sudah terdaftar');
  }

  const category = await prisma.letterCategory.create({
    data,
  });

  return category;
};

/**
 * List letter categories
 */
export const listLetterCategories = async (filters: LetterCategoryFilters) => {
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

  const total = await prisma.letterCategory.count({ where });

  const categories = await prisma.letterCategory.findMany({
    where,
    orderBy: { name: 'asc' },
    skip,
    take: limit,
  });

  return {
    data: categories,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Update letter category
 */
export const updateLetterCategory = async (id: string, data: UpdateLetterCategoryDto) => {
  const category = await prisma.letterCategory.update({
    where: { id },
    data,
  });

  return category;
};

// ============================================
// LETTERHEAD / KOP SURAT
// ============================================

/**
 * Create letterhead
 */
export const createLetterhead = async (data: CreateLetterheadDto) => {
  // If isDefault, unset other defaults
  if (data.isDefault) {
    await prisma.letterhead.updateMany({
      data: { isDefault: false },
    });
  }

  const letterhead = await prisma.letterhead.create({
    data,
  });

  return letterhead;
};

/**
 * List letterheads
 */
export const listLetterheads = async (filters: LetterheadFilters) => {
  const where: any = {};
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive;
  }

  if (filters.isDefault !== undefined) {
    where.isDefault = filters.isDefault;
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { unit: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const total = await prisma.letterhead.count({ where });

  const letterheads = await prisma.letterhead.findMany({
    where,
    orderBy: [{ isDefault: 'desc' }, { name: 'asc' }],
    skip,
    take: limit,
  });

  return {
    data: letterheads,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get default letterhead
 */
export const getDefaultLetterhead = async () => {
  const letterhead = await prisma.letterhead.findFirst({
    where: {
      isActive: true,
      isDefault: true,
    },
  });

  return letterhead;
};

/**
 * Update letterhead
 */
export const updateLetterhead = async (id: string, data: UpdateLetterheadDto) => {
  // If isDefault, unset other defaults
  if (data.isDefault) {
    await prisma.letterhead.updateMany({
      where: { id: { not: id } },
      data: { isDefault: false },
    });
  }

  const letterhead = await prisma.letterhead.update({
    where: { id },
    data,
  });

  return letterhead;
};

// ============================================
// LETTER TEMPLATE
// ============================================

/**
 * Create letter template
 */
export const createLetterTemplate = async (data: CreateLetterTemplateDto) => {
  // Check if code exists
  const existing = await prisma.letterTemplate.findUnique({
    where: { code: data.code },
  });

  if (existing) {
    throw new Error('Kode template sudah terdaftar');
  }

  const template = await prisma.letterTemplate.create({
    data,
    include: {
      letterhead: true,
    },
  });

  return template;
};

/**
 * List letter templates
 */
export const listLetterTemplates = async (filters: LetterTemplateFilters) => {
  const where: any = {};
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  if (filters.type) {
    where.type = filters.type;
  }

  if (filters.letterheadId) {
    where.letterheadId = filters.letterheadId;
  }

  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive;
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: 'insensitive' } },
      { code: { contains: filters.search, mode: 'insensitive' } },
      { type: { contains: filters.search, mode: 'insensitive' } },
    ];
  }

  const total = await prisma.letterTemplate.count({ where });

  const templates = await prisma.letterTemplate.findMany({
    where,
    include: {
      letterhead: true,
    },
    orderBy: { name: 'asc' },
    skip,
    take: limit,
  });

  return {
    data: templates,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get letter template by ID
 */
export const getLetterTemplateById = async (id: string) => {
  const template = await prisma.letterTemplate.findUnique({
    where: { id },
    include: {
      letterhead: true,
    },
  });

  if (!template) {
    throw new Error('Template tidak ditemukan');
  }

  return template;
};

/**
 * Update letter template
 */
export const updateLetterTemplate = async (id: string, data: UpdateLetterTemplateDto) => {
  const template = await prisma.letterTemplate.update({
    where: { id },
    data,
    include: {
      letterhead: true,
    },
  });

  return template;
};

/**
 * Delete letter template
 */
export const deleteLetterTemplate = async (id: string) => {
  await prisma.letterTemplate.delete({
    where: { id },
  });

  return { message: 'Template berhasil dihapus' };
};

/**
 * Render template with data
 */
export const renderTemplate = async (data: RenderTemplateDto) => {
  const template = await prisma.letterTemplate.findUnique({
    where: { id: data.templateId },
    include: {
      letterhead: true,
    },
  });

  if (!template) {
    throw new Error('Template tidak ditemukan');
  }

  // Replace variables in content
  let content = template.content;

  for (const variable of template.variables) {
    const placeholder = `{{${variable}}}`;
    const value = data.data[variable] || `[${variable}]`;
    content = content.replace(new RegExp(placeholder, 'g'), value);
  }

  return {
    content,
    template: {
      id: template.id,
      name: template.name,
      type: template.type,
      letterhead: template.letterhead,
    },
  };
};
