/**
 * Template & Letterhead Controller
 * Handles HTTP requests for templates, letterheads, and categories
 */

import { Request, Response, NextFunction } from 'express';
import * as templateService from '../services/template.service';

// ============================================
// LETTER CATEGORY
// ============================================

export const createLetterCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await templateService.createLetterCategory(req.body);

    res.status(201).json({
      success: true,
      data: category,
      message: 'Kategori surat berhasil dibuat',
    });
  } catch (error) {
    next(error);
  }
};

export const listLetterCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { isActive, search, page = '1', limit = '50' } = req.query;

    const result = await templateService.listLetterCategories({
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
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

export const updateLetterCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const category = await templateService.updateLetterCategory(id, req.body);

    res.json({
      success: true,
      data: category,
      message: 'Kategori surat berhasil diupdate',
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// LETTERHEAD / KOP SURAT
// ============================================

export const createLetterhead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = {
      ...req.body,
      ...(req.file && {
        logoUrl: `/uploads/documents/${req.file.filename}`,
      }),
    };

    const letterhead = await templateService.createLetterhead(data);

    res.status(201).json({
      success: true,
      data: letterhead,
      message: 'Kop surat berhasil dibuat',
    });
  } catch (error) {
    next(error);
  }
};

export const listLetterheads = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { isActive, isDefault, search, page = '1', limit = '20' } = req.query;

    const result = await templateService.listLetterheads({
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
      isDefault: isDefault === 'true' ? true : isDefault === 'false' ? false : undefined,
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

export const getDefaultLetterhead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const letterhead = await templateService.getDefaultLetterhead();

    res.json({
      success: true,
      data: letterhead,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLetterhead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const data = {
      ...req.body,
      ...(req.file && {
        logoUrl: `/uploads/documents/${req.file.filename}`,
      }),
    };

    const letterhead = await templateService.updateLetterhead(id, data);

    res.json({
      success: true,
      data: letterhead,
      message: 'Kop surat berhasil diupdate',
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// LETTER TEMPLATE
// ============================================

export const createLetterTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const template = await templateService.createLetterTemplate(req.body);

    res.status(201).json({
      success: true,
      data: template,
      message: 'Template surat berhasil dibuat',
    });
  } catch (error) {
    next(error);
  }
};

export const listLetterTemplates = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { type, letterheadId, isActive, search, page = '1', limit = '20' } = req.query;

    const result = await templateService.listLetterTemplates({
      type: type as string,
      letterheadId: letterheadId as string,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined,
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

export const getLetterTemplateById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const template = await templateService.getLetterTemplateById(id);

    res.json({
      success: true,
      data: template,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLetterTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const template = await templateService.updateLetterTemplate(id, req.body);

    res.json({
      success: true,
      data: template,
      message: 'Template surat berhasil diupdate',
    });
  } catch (error) {
    next(error);
  }
};

export const deleteLetterTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await templateService.deleteLetterTemplate(id);

    res.json({
      success: true,
      message: 'Template surat berhasil dihapus',
    });
  } catch (error) {
    next(error);
  }
};

export const renderTemplate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await templateService.renderTemplate(req.body);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
