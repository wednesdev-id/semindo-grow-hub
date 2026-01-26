/**
 * Disposition Controller
 * Handles HTTP requests for dispositions
 */

import { Request, Response, NextFunction } from 'express';
import * as dispositionService from '../services/disposition.service';

/**
 * Create disposition
 */
export const createDisposition = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;

    const data = {
      ...req.body,
    };

    const disposition = await dispositionService.createDisposition(data, userId);

    res.status(201).json({
      success: true,
      data: disposition,
      message: 'Disposisi berhasil dibuat',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * List dispositions
 */
export const listDispositions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const {
      incomingLetterId,
      fromUserId,
      toUserId,
      status,
      startDate,
      endDate,
      page = '1',
      limit = '20',
    } = req.query;

    const result = await dispositionService.listDispositions(
      {
        incomingLetterId: incomingLetterId as string,
        fromUserId: fromUserId as string,
        toUserId: toUserId as string,
        status: status as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
      },
      userId
    );

    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get disposition by ID
 */
export const getDispositionById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const disposition = await dispositionService.getDispositionById(id);

    res.json({
      success: true,
      data: disposition,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update disposition status
 */
export const updateDisposition = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    const disposition = await dispositionService.updateDisposition(id, req.body, userId);

    res.json({
      success: true,
      data: disposition,
      message: 'Disposisi berhasil diupdate',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete disposition
 */
export const deleteDisposition = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = (req as any).user.id;

    await dispositionService.deleteDisposition(id, userId);

    res.json({
      success: true,
      message: 'Disposisi berhasil dihapus',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get pending dispositions count for current user
 */
export const getPendingCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;

    const count = await dispositionService.getPendingDispositionsCount(userId);

    res.json({
      success: true,
      data: { count },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get disposition chain for incoming letter
 */
export const getDispositionChain = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { incomingLetterId } = req.params;

    const chain = await dispositionService.getDispositionChain(incomingLetterId);

    res.json({
      success: true,
      data: chain,
    });
  } catch (error) {
    next(error);
  }
};
