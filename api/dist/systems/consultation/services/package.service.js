"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.packageService = void 0;
const prisma_1 = require("../../../lib/prisma");
exports.packageService = {
    /**
     * Create a new consultation package
     */
    async createPackage(data) {
        // Get the next sort order if not specified
        if (data.sortOrder === undefined) {
            const lastPackage = await prisma_1.prisma.consultationPackage.findFirst({
                where: { consultantId: data.consultantId },
                orderBy: { sortOrder: 'desc' }
            });
            data.sortOrder = (lastPackage?.sortOrder ?? -1) + 1;
        }
        return prisma_1.prisma.consultationPackage.create({
            data: {
                consultantId: data.consultantId,
                name: data.name,
                durationMinutes: data.durationMinutes,
                price: data.price,
                description: data.description,
                isActive: data.isActive ?? true,
                sortOrder: data.sortOrder
            }
        });
    },
    /**
     * Get all packages for a consultant (for consultant's own management)
     */
    async getPackagesByConsultant(consultantId) {
        return prisma_1.prisma.consultationPackage.findMany({
            where: { consultantId },
            orderBy: { sortOrder: 'asc' }
        });
    },
    /**
     * Get active packages for a consultant (for public display)
     */
    async getActivePackages(consultantId) {
        return prisma_1.prisma.consultationPackage.findMany({
            where: {
                consultantId,
                isActive: true
            },
            orderBy: { sortOrder: 'asc' }
        });
    },
    /**
     * Get a single package by ID
     */
    async getPackageById(packageId) {
        return prisma_1.prisma.consultationPackage.findUnique({
            where: { id: packageId }
        });
    },
    /**
     * Update a package
     */
    async updatePackage(packageId, data) {
        return prisma_1.prisma.consultationPackage.update({
            where: { id: packageId },
            data
        });
    },
    /**
     * Delete a package
     */
    async deletePackage(packageId) {
        // Check if package has any requests
        const requestCount = await prisma_1.prisma.consultationRequest.count({
            where: { packageId }
        });
        if (requestCount > 0) {
            // Soft delete by deactivating instead
            return prisma_1.prisma.consultationPackage.update({
                where: { id: packageId },
                data: { isActive: false }
            });
        }
        // Hard delete if no requests
        return prisma_1.prisma.consultationPackage.delete({
            where: { id: packageId }
        });
    },
    /**
     * Verify package ownership
     */
    async verifyOwnership(packageId, consultantId) {
        const pkg = await prisma_1.prisma.consultationPackage.findUnique({
            where: { id: packageId }
        });
        return pkg?.consultantId === consultantId;
    },
    /**
     * Reorder packages
     */
    async reorderPackages(consultantId, packageIds) {
        const updates = packageIds.map((id, index) => prisma_1.prisma.consultationPackage.update({
            where: { id },
            data: { sortOrder: index }
        }));
        return prisma_1.prisma.$transaction(updates);
    }
};
