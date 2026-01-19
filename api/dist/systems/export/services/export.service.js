"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExportService = void 0;
const prisma_1 = require("../../../lib/prisma");
class ExportService {
    async getHSCodes(query) {
        const where = query
            ? {
                OR: [
                    { code: { contains: query, mode: "insensitive" } },
                    { description: { contains: query, mode: "insensitive" } },
                ],
            }
            : {};
        return prisma_1.prisma.exportHSCode.findMany({
            where,
            orderBy: { code: "asc" },
            take: 50, // Limit results
        });
    }
    async getCountries() {
        return prisma_1.prisma.exportCountry.findMany({
            orderBy: { name: "asc" },
        });
    }
    async getBuyers(filters) {
        const where = {};
        if (filters.countryId && filters.countryId !== "all") {
            where.countryId = filters.countryId;
        }
        if (filters.category && filters.category !== "all") {
            where.category = { contains: filters.category, mode: "insensitive" };
        }
        return prisma_1.prisma.exportBuyer.findMany({
            where,
            include: {
                country: true,
            },
            orderBy: { rating: "desc" },
        });
    }
}
exports.ExportService = ExportService;
