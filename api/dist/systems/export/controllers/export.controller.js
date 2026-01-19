"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBuyers = exports.getCountries = exports.getHSCodes = void 0;
const export_service_1 = require("../services/export.service");
const exportService = new export_service_1.ExportService();
const getHSCodes = async (req, res, next) => {
    try {
        const query = req.query.q;
        const data = await exportService.getHSCodes(query);
        res.json({
            status: "success",
            data,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getHSCodes = getHSCodes;
const getCountries = async (req, res, next) => {
    try {
        const data = await exportService.getCountries();
        res.json({
            status: "success",
            data,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCountries = getCountries;
const getBuyers = async (req, res, next) => {
    try {
        const { countryId, category } = req.query;
        const data = await exportService.getBuyers({
            countryId: countryId,
            category: category,
        });
        res.json({
            status: "success",
            data,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getBuyers = getBuyers;
