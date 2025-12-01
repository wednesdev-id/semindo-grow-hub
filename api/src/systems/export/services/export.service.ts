import { prisma } from '../../../lib/prisma';
import { Prisma } from "@prisma/client";

export class ExportService {
    async getHSCodes(query?: string) {
        const where: Prisma.ExportHSCodeWhereInput = query
            ? {
                OR: [
                    { code: { contains: query, mode: "insensitive" } },
                    { description: { contains: query, mode: "insensitive" } },
                ],
            }
            : {};

        return prisma.exportHSCode.findMany({
            where,
            orderBy: { code: "asc" },
            take: 50, // Limit results
        });
    }

    async getCountries() {
        return prisma.exportCountry.findMany({
            orderBy: { name: "asc" },
        });
    }

    async getBuyers(filters: { countryId?: string; category?: string }) {
        const where: Prisma.ExportBuyerWhereInput = {};

        if (filters.countryId && filters.countryId !== "all") {
            where.countryId = filters.countryId;
        }

        if (filters.category && filters.category !== "all") {
            where.category = { contains: filters.category, mode: "insensitive" };
        }

        return prisma.exportBuyer.findMany({
            where,
            include: {
                country: true,
            },
            orderBy: { rating: "desc" },
        });
    }
}
