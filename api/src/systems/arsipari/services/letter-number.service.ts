/**
 * Letter Number Generation Service
 * Handles auto-generation of letter numbers with various formats
 */

import { prisma } from '../../../lib/prisma';

export interface NumberFormatOptions {
  format: string; // e.g., "NO/UNIT/BULAN/TAHUN", "NO.URUT/TAHUN"
  unit?: string;
  categoryCode?: string;
  date?: Date;
}

/**
 * Generate letter number based on format
 * Format placeholders:
 * - NO: Auto-increment number
 * - UNIT: Unit name
 * - BULAN: Month in Roman (I, II, III, etc)
 * - TAHUN: Year (YYYY)
 * - BULAN_ID: Month in Indonesian (Januari, Februari, etc)
 */
export const generateLetterNumber = async (
  type: 'INCOMING' | 'OUTGOING',
  options: NumberFormatOptions
): Promise<string> => {
  const { format, unit, categoryCode, date = new Date() } = options;

  // Get the next sequence number for this month/year
  const year = date.getFullYear();
  const month = date.getMonth() + 1;

  // Count existing letters for this month/year
  const count = await prisma.outgoingLetter.count({
    where: {
      createdAt: {
        gte: new Date(year, month - 1, 1),
        lt: new Date(year, month, 1),
      },
      letterNumber: {
        not: null,
      },
    },
  });

  const nextNumber = count + 1;

  // Convert month to Roman numeral
  const monthRoman = toRoman(month);
  const monthIndonesian = toIndonesianMonth(month);
  const monthPadded = month.toString().padStart(2, '0');
  const yearStr = year.toString();
  const numberPadded = nextNumber.toString().padStart(4, '0');

  // Replace placeholders
  let result = format
    .replace(/NO/g, numberPadded)
    .replace(/UNIT/g, unit || 'UMUM')
    .replace(/BULAN/g, monthRoman)
    .replace(/BULAN_ID/g, monthIndonesian)
    .replace(/TAHUN/g, yearStr)
    .replace(/MM/g, monthPadded)
    .replace(/CODE/g, categoryCode || 'SURAT');

  return result;
};

/**
 * Convert month number to Roman numeral
 */
const toRoman = (month: number): string => {
  const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];
  return romanNumerals[month - 1] || 'I';
};

/**
 * Convert month number to Indonesian month name
 */
const toIndonesianMonth = (month: number): string => {
  const months = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];
  return months[month - 1] || 'Januari';
};

/**
 * Parse number format from template
 */
export const parseNumberFormat = (
  format: string | null | undefined
): string => {
  if (!format) {
    // Default format: NO/BULAN/TAHUN
    return 'NO/BULAN/TAHUN';
  }
  return format;
};

/**
 * Generate archive number
 * Format: ARSIP/TAHUN/BULAN/NO
 */
export const generateArchiveNumber = async (
  letterType: 'MASUK' | 'KELUAR',
  year: number,
  month: number
): Promise<string> => {
  // Count existing archives for this month/year
  const count = await prisma.archive.count({
    where: {
      archiveYear: year,
      archiveMonth: month,
      letterType,
    },
  });

  const nextNumber = count + 1;
  const numberPadded = nextNumber.toString().padStart(4, '0');
  const monthPadded = month.toString().padStart(2, '0');

  return `ARSIP/${letterType}/${year}/${monthPadded}/${numberPadded}`;
};

/**
 * Validate letter number format
 */
export const validateLetterNumber = (letterNumber: string): boolean => {
  // Basic validation - must contain at least one number
  return /\d/.test(letterNumber);
};
