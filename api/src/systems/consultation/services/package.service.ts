import { prisma } from '../../../lib/prisma';

interface CreatePackageData {
    consultantId: string;
    name: string;
    durationMinutes: number;
    price: number;
    description?: string;
    isActive?: boolean;
    sortOrder?: number;
}

interface UpdatePackageData {
    name?: string;
    durationMinutes?: number;
    price?: number;
    description?: string;
    isActive?: boolean;
    sortOrder?: number;
}

export const packageService = {
    /**
     * Create a new consultation package
     */
    async createPackage(data: CreatePackageData) {
        // Get the next sort order if not specified
        if (data.sortOrder === undefined) {
            const lastPackage = await prisma.consultationPackage.findFirst({
                where: { consultantId: data.consultantId },
                orderBy: { sortOrder: 'desc' }
            });
            data.sortOrder = (lastPackage?.sortOrder ?? -1) + 1;
        }

        return prisma.consultationPackage.create({
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
    async getPackagesByConsultant(consultantId: string) {
        return prisma.consultationPackage.findMany({
            where: { consultantId },
            orderBy: { sortOrder: 'asc' }
        });
    },

    /**
     * Get active packages for a consultant (for public display)
     */
    async getActivePackages(consultantId: string) {
        return prisma.consultationPackage.findMany({
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
    async getPackageById(packageId: string) {
        return prisma.consultationPackage.findUnique({
            where: { id: packageId }
        });
    },

    /**
     * Update a package
     */
    async updatePackage(packageId: string, data: UpdatePackageData) {
        return prisma.consultationPackage.update({
            where: { id: packageId },
            data
        });
    },

    /**
     * Delete a package
     */
    async deletePackage(packageId: string) {
        // Check if package has any requests
        const requestCount = await prisma.consultationRequest.count({
            where: { packageId }
        });

        if (requestCount > 0) {
            // Soft delete by deactivating instead
            return prisma.consultationPackage.update({
                where: { id: packageId },
                data: { isActive: false }
            });
        }

        // Hard delete if no requests
        return prisma.consultationPackage.delete({
            where: { id: packageId }
        });
    },

    /**
     * Verify package ownership
     */
    async verifyOwnership(packageId: string, consultantId: string): Promise<boolean> {
        const pkg = await prisma.consultationPackage.findUnique({
            where: { id: packageId }
        });
        return pkg?.consultantId === consultantId;
    },

    /**
     * Reorder packages
     */
    async reorderPackages(consultantId: string, packageIds: string[]) {
        const updates = packageIds.map((id, index) =>
            prisma.consultationPackage.update({
                where: { id },
                data: { sortOrder: index }
            })
        );
        return prisma.$transaction(updates);
    }
};
