import { Request, Response, NextFunction } from "express";
import { ExportService } from "../services/export.service";

const exportService = new ExportService();

export const getHSCodes = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const query = req.query.q as string;
        const data = await exportService.getHSCodes(query);
        res.json({
            status: "success",
            data,
        });
    } catch (error) {
        next(error);
    }
};

export const getCountries = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const data = await exportService.getCountries();
        res.json({
            status: "success",
            data,
        });
    } catch (error) {
        next(error);
    }
};

export const getBuyers = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { countryId, category } = req.query;
        const data = await exportService.getBuyers({
            countryId: countryId as string,
            category: category as string,
        });
        res.json({
            status: "success",
            data,
        });
    } catch (error) {
        next(error);
    }
};
