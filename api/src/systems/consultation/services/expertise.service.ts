import { prisma } from '../../../lib/prisma';

interface CreateExpertiseData {
    name: string;
    description?: string;
    icon?: string;
    categoryGroup?: string;
}

interface UpdateExpertiseData {
    name?: string;
    description?: string;
    icon?: string;
    categoryGroup?: string;
    isActive?: boolean;
}

interface ListExpertiseFilters {
    search?: string;
    isActive?: boolean;
    isDeleted?: boolean;
    limit?: number;
    offset?: number;
}

/**
 * Create slug from name
 */
function createSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

/**
 * Create audit log entry
 */
async function createAuditLog(
    expertiseId: string,
    action: string,
    oldValue: any,
    newValue: any,
    userId: string
) {
    await prisma.expertiseAuditLog.create({
        data: {
            expertiseId,
            action,
            oldValue: oldValue ? JSON.parse(JSON.stringify(oldValue)) : null,
            newValue: newValue ? JSON.parse(JSON.stringify(newValue)) : null,
            changedBy: userId
        }
    });
}

/**
 * List all expertise categories with optional filters
 */
export const listExpertise = async (filters: ListExpertiseFilters = {}) => {
    const {
        search,
        isActive,
        isDeleted = false,
        limit = 50,
        offset = 0
    } = filters;

    const where: any = {
        isDeleted
    };

    if (isActive !== undefined) {
        where.isActive = isActive;
    }

    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } }
        ];
    }

    const [items, total] = await Promise.all([
        prisma.expertiseCategory.findMany({
            where,
            include: {
                _count: {
                    select: {
                        consultants: true
                    }
                },
                creator: {
                    select: {
                        id: true,
                        fullName: true
                    }
                }
            },
            orderBy: { name: 'asc' },
            skip: offset,
            take: limit
        }),
        prisma.expertiseCategory.count({ where })
    ]);

    return {
        items: items.map(item => ({
            ...item,
            consultantCount: item._count.consultants
        })),
        total,
        limit,
        offset
    };
};

/**
 * Get single expertise by ID
 */
export const getExpertiseById = async (id: string) => {
    const expertise = await prisma.expertiseCategory.findUnique({
        where: { id },
        include: {
            _count: {
                select: {
                    consultants: true
                }
            },
            creator: {
                select: {
                    id: true,
                    fullName: true
                }
            }
        }
    });

    if (!expertise) {
        throw new Error('Expertise category not found');
    }

    return {
        ...expertise,
        consultantCount: expertise._count.consultants
    };
};

/**
 * Create new expertise category
 */
export const createExpertise = async (data: CreateExpertiseData, userId: string) => {
    const slug = createSlug(data.name);

    // Check if already exists
    const existing = await prisma.expertiseCategory.findFirst({
        where: {
            OR: [
                { name: { equals: data.name, mode: 'insensitive' } },
                { slug }
            ]
        }
    });

    if (existing) {
        throw new Error('Expertise category with this name already exists');
    }

    const expertise = await prisma.expertiseCategory.create({
        data: {
            name: data.name,
            slug,
            description: data.description,
            icon: data.icon || 'Briefcase',
            categoryGroup: data.categoryGroup,
            createdBy: userId
        }
    });

    // Create audit log
    await createAuditLog(expertise.id, 'create', null, expertise, userId);

    return expertise;
};

/**
 * Update expertise category
 */
export const updateExpertise = async (
    id: string,
    data: UpdateExpertiseData,
    userId: string
) => {
    const existing = await prisma.expertiseCategory.findUnique({
        where: { id }
    });

    if (!existing) {
        throw new Error('Expertise category not found');
    }

    // If name is being changed, check uniqueness
    if (data.name && data.name !== existing.name) {
        const slug = createSlug(data.name);
        const duplicate = await prisma.expertiseCategory.findFirst({
            where: {
                id: { not: id },
                OR: [
                    { name: { equals: data.name, mode: 'insensitive' } },
                    { slug }
                ]
            }
        });

        if (duplicate) {
            throw new Error('Expertise category with this name already exists');
        }
    }

    const updated = await prisma.expertiseCategory.update({
        where: { id },
        data: {
            name: data.name,
            slug: data.name ? createSlug(data.name) : undefined,
            description: data.description,
            icon: data.icon,
            categoryGroup: data.categoryGroup,
            isActive: data.isActive
        }
    });

    // Create audit log
    await createAuditLog(id, 'update', existing, updated, userId);

    return updated;
};

/**
 * Soft delete expertise category
 */
export const softDeleteExpertise = async (id: string, userId: string) => {
    const existing = await prisma.expertiseCategory.findUnique({
        where: { id },
        include: {
            _count: {
                select: { consultants: true }
            }
        }
    });

    if (!existing) {
        throw new Error('Expertise category not found');
    }

    const updated = await prisma.expertiseCategory.update({
        where: { id },
        data: {
            isDeleted: true,
            deletedAt: new Date(),
            isActive: false
        }
    });

    // Create audit log
    await createAuditLog(id, 'delete', existing, updated, userId);

    return {
        ...updated,
        consultantCount: existing._count.consultants
    };
};

/**
 * Restore deleted expertise
 */
export const restoreExpertise = async (id: string, userId: string) => {
    const existing = await prisma.expertiseCategory.findUnique({
        where: { id }
    });

    if (!existing) {
        throw new Error('Expertise category not found');
    }

    if (!existing.isDeleted) {
        throw new Error('Expertise category is not deleted');
    }

    const updated = await prisma.expertiseCategory.update({
        where: { id },
        data: {
            isDeleted: false,
            deletedAt: null,
            isActive: true
        }
    });

    // Create audit log
    await createAuditLog(id, 'restore', existing, updated, userId);

    return updated;
};

/**
 * Get usage stats for an expertise
 */
export const getExpertiseUsageStats = async (id: string) => {
    const expertise = await prisma.expertiseCategory.findUnique({
        where: { id },
        include: {
            consultants: {
                include: {
                    consultant: {
                        select: {
                            id: true,
                            user: {
                                select: {
                                    fullName: true,
                                    profilePictureUrl: true
                                }
                            },
                            title: true,
                            status: true
                        }
                    }
                }
            }
        }
    });

    if (!expertise) {
        throw new Error('Expertise category not found');
    }

    return {
        id: expertise.id,
        name: expertise.name,
        totalConsultants: expertise.consultants.length,
        consultants: expertise.consultants.map(ce => ({
            id: ce.consultant.id,
            name: ce.consultant.user.fullName,
            title: ce.consultant.title,
            profilePicture: ce.consultant.user.profilePictureUrl,
            status: ce.consultant.status
        }))
    };
};

/**
 * Migrate consultants from one expertise to another
 */
export const migrateConsultants = async (
    fromId: string,
    toId: string,
    userId: string
) => {
    const [fromExpertise, toExpertise] = await Promise.all([
        prisma.expertiseCategory.findUnique({ where: { id: fromId } }),
        prisma.expertiseCategory.findUnique({ where: { id: toId } })
    ]);

    if (!fromExpertise || !toExpertise) {
        throw new Error('One or both expertise categories not found');
    }

    // Get all consultants with from expertise
    const consultantExpertise = await prisma.consultantExpertise.findMany({
        where: { expertiseId: fromId }
    });

    let migratedCount = 0;

    for (const ce of consultantExpertise) {
        // Check if consultant already has the target expertise
        const existing = await prisma.consultantExpertise.findUnique({
            where: {
                consultantId_expertiseId: {
                    consultantId: ce.consultantId,
                    expertiseId: toId
                }
            }
        });

        if (!existing) {
            // Create new association
            await prisma.consultantExpertise.create({
                data: {
                    consultantId: ce.consultantId,
                    expertiseId: toId
                }
            });
            migratedCount++;
        }

        // Delete old association
        await prisma.consultantExpertise.delete({
            where: { id: ce.id }
        });
    }

    // Create audit log
    await createAuditLog(fromId, 'migrate', null, {
        from: fromExpertise.name,
        to: toExpertise.name,
        count: migratedCount
    }, userId);

    return {
        from: fromExpertise.name,
        to: toExpertise.name,
        migratedCount
    };
};
