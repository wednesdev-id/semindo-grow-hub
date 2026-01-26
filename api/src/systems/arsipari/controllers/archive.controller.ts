/**
 * Archive Controller
 * Handles HTTP requests for archives
 */

import { Request, Response, NextFunction } from 'express';
import * as archiveService from '../services/archive.service';

/**
 * Archive incoming letter
 */
export const archiveIncomingLetter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { incomingLetterId } = req.params;
    const userId = (req as any).user.id;

    const data = {
      ...req.body,
      createdBy: userId,
    };

    const archive = await archiveService.archiveIncomingLetter(incomingLetterId as string, data);

    res.status(201).json({
      success: true,
      data: archive,
      message: 'Surat masuk berhasil diarsipkan',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Archive outgoing letter
 */
export const archiveOutgoingLetter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { outgoingLetterId } = req.params;
    const userId = (req as any).user.id;

    const data = {
      ...req.body,
      createdBy: userId,
    };

    const archive = await archiveService.archiveOutgoingLetter(outgoingLetterId as string, data);

    res.status(201).json({
      success: true,
      data: archive,
      message: 'Surat keluar berhasil diarsipkan',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List archives
 */
export const listArchives = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      letterType,
      categoryId,
      archiveYear,
      archiveMonth,
      status,
      protectionLevel,
      search,
      page = '1',
      limit = '20',
    } = req.query;

    const result = await archiveService.listArchives({
      letterType: letterType as string,
      categoryId: categoryId as string,
      archiveYear: archiveYear ? parseInt(archiveYear as string) : undefined,
      archiveMonth: archiveMonth ? parseInt(archiveMonth as string) : undefined,
      status: status as string,
      protectionLevel: protectionLevel as string,
      search: search as string,
      page: parseInt(page as string),
      limit: parseInt(limit as string),
    });

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get archive by ID
 */
export const getArchiveById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const archive = await archiveService.getArchiveById(id as string);

    res.json({
      success: true,
      data: archive,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update archive
 */
export const updateArchive = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const archive = await archiveService.updateArchive(id as string, req.body);

    res.json({
      success: true,
      data: archive,
      message: 'Arsip berhasil diupdate',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete archive (soft delete)
 */
export const deleteArchive = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await archiveService.deleteArchive(id as string);

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get archive statistics
 */
export const getStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await archiveService.getArchiveStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get archives by period
 */
export const getArchivesByPeriod = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { year, month } = req.params;

    const archives = await archiveService.getArchivesByPeriod(
      parseInt(year as string),
      month ? parseInt(month as string) : undefined
    );

    res.json({
      success: true,
      data: archives,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get disposal candidates
 */
export const getDisposalCandidates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const archives = await archiveService.getDisposalCandidates();

    res.json({
      success: true,
      data: archives,
    });
  } catch (error) {
    next(error);
  }
};
