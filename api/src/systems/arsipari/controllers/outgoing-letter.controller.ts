/**
 * Outgoing Letter Controller
 * Handles HTTP requests for outgoing letters
 */

import { Request, Response, NextFunction } from 'express';
import * as outgoingLetterService from '../services/outgoing-letter.service';

/**
 * Create outgoing letter (draft)
 */
export const createOutgoingLetter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;

    const data = {
      ...req.body,
      createdBy: userId,
    };

    const letter = await outgoingLetterService.createOutgoingLetter(data);

    res.status(201).json({
      success: true,
      data: letter,
      message: 'Draft surat keluar berhasil dibuat',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List outgoing letters
 */
export const listOutgoingLetters = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      status,
      categoryId,
      startDate,
      endDate,
      templateId,
      search,
      page = '1',
      limit = '20',
    } = req.query;

    const result = await outgoingLetterService.listOutgoingLetters({
      status: status as string,
      categoryId: categoryId as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      templateId: templateId as string,
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
 * Get outgoing letter by ID
 */
export const getOutgoingLetterById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const letter = await outgoingLetterService.getOutgoingLetterById(id);

    res.json({
      success: true,
      data: letter,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update outgoing letter
 */
export const updateOutgoingLetter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const letter = await outgoingLetterService.updateOutgoingLetter(id, req.body);

    res.json({
      success: true,
      data: letter,
      message: 'Surat keluar berhasil diupdate',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit for approval
 */
export const submitApproval = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await outgoingLetterService.submitForApproval(id, req.body);

    res.json({
      success: true,
      data: result,
      message: 'Surat diajukan untuk approval',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approve/Reject letter
 */
export const processApproval = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { approvalId } = req.params;
    const userId = (req as any).user.id;

    const result = await outgoingLetterService.processApproval(
      id,
      approvalId,
      req.body,
      userId
    );

    const message = req.body.status === 'APPROVED' ? 'Surat disetujui' : 'Surat ditolak';

    res.json({
      success: true,
      data: result,
      message,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Publish letter (generate letter number)
 */
export const publishLetter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { letterDate, letterNumber } = req.body;

    const result = await outgoingLetterService.publishLetter(
      id,
      new Date(letterDate),
      letterNumber
    );

    res.json({
      success: true,
      data: result,
      message: 'Surat berhasil diterbitkan',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete outgoing letter
 */
export const deleteOutgoingLetter = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await outgoingLetterService.deleteOutgoingLetter(id);

    res.json({
      success: true,
      message: 'Surat keluar berhasil dihapus',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get outgoing letter statistics
 */
export const getStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await outgoingLetterService.getOutgoingLetterStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
