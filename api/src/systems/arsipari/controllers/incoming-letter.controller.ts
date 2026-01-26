/**
 * Incoming Letter Controller
 * Handles HTTP requests for incoming letters
 */

import { Request, Response, NextFunction } from 'express';
import * as incomingLetterService from '../services/incoming-letter.service';
import { s3Service } from '../../../services/s3.service';
import path from 'path';

/**
 * Create incoming letter
 */
export const createIncomingLetter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;

    // If file was uploaded, upload to S3
    let fileInfo = {};
    if (req.file) {
      const fileExt = path.extname(req.file.originalname);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      // Clean filename
      const baseName = path.basename(req.file.originalname, fileExt).replace(/[^a-zA-Z0-9]/g, '-');
      // Set key with folder
      const key = `arsipari/incoming/${baseName}-${uniqueSuffix}${fileExt}`;

      const url = await s3Service.uploadFile(
        req.file.buffer,
        key,
        req.file.mimetype
      );

      fileInfo = {
        fileUrl: url,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      };
    }

    const data = {
      ...req.body,
      createdBy: userId,
      ...fileInfo,
    };

    const letter = await incomingLetterService.createIncomingLetter(data);

    res.status(201).json({
      success: true,
      data: letter,
      message: 'Surat masuk berhasil dibuat',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List incoming letters
 */
export const listIncomingLetters = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      status,
      categoryId,
      startDate,
      endDate,
      priority,
      classification,
      search,
      page = '1',
      limit = '20',
    } = req.query;

    const result = await incomingLetterService.listIncomingLetters({
      status: status as string,
      categoryId: categoryId as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      priority: priority as string,
      classification: classification as string,
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
 * Get incoming letter by ID
 */
export const getIncomingLetterById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const letter = await incomingLetterService.getIncomingLetterById(id);

    res.json({
      success: true,
      data: letter,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update incoming letter
 */
export const updateIncomingLetter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    // If file was uploaded, upload to S3
    let fileInfo = {};
    if (req.file) {
      const fileExt = path.extname(req.file.originalname);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const baseName = path.basename(req.file.originalname, fileExt).replace(/[^a-zA-Z0-9]/g, '-');
      const key = `arsipari/incoming/${baseName}-${uniqueSuffix}${fileExt}`;

      const url = await s3Service.uploadFile(
        req.file.buffer,
        key,
        req.file.mimetype
      );

      fileInfo = {
        fileUrl: url,
        fileName: req.file.originalname,
        fileSize: req.file.size,
        mimeType: req.file.mimetype,
      };
    }

    const data = {
      ...req.body,
      ...fileInfo,
    };

    const letter = await incomingLetterService.updateIncomingLetter(id, data);

    res.json({
      success: true,
      data: letter,
      message: 'Surat masuk berhasil diupdate',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update incoming letter status
 */
export const updateStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const letter = await incomingLetterService.updateIncomingLetterStatus(id, status, notes);

    res.json({
      success: true,
      data: letter,
      message: 'Status surat masuk berhasil diupdate',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete incoming letter
 */
export const deleteIncomingLetter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await incomingLetterService.deleteIncomingLetter(id);

    res.json({
      success: true,
      message: 'Surat masuk berhasil dihapus',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get incoming letter statistics
 */
export const getStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await incomingLetterService.getIncomingLetterStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
