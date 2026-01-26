/**
 * Letter Subject Controller
 * Handles HTTP requests for letter subjects
 */

import { Request, Response, NextFunction } from 'express';
import * as letterSubjectService from '../services/letter-subject.service';

export const createLetterSubject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const subject = await letterSubjectService.createLetterSubject(req.body);

        res.status(201).json({
            success: true,
            data: subject,
            message: 'Perihal surat berhasil dibuat',
        });
    } catch (error) {
        next(error);
    }
};

export const listLetterSubjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { isActive, search, page = '1', limit = '50' } = req.query;

        const result = await letterSubjectService.listLetterSubjects({
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

export const updateLetterSubject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        const subject = await letterSubjectService.updateLetterSubject(id, req.body);

        res.json({
            success: true,
            data: subject,
            message: 'Perihal surat berhasil diupdate',
        });
    } catch (error) {
        next(error);
    }
};

export const deleteLetterSubject = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;

        await letterSubjectService.deleteLetterSubject(id);

        res.json({
            success: true,
            message: 'Perihal surat berhasil dihapus',
        });
    } catch (error) {
        next(error);
    }
};
