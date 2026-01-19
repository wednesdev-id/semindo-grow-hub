"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrateConsultants = exports.getExpertiseUsageStats = exports.restoreExpertise = exports.softDeleteExpertise = exports.updateExpertise = exports.createExpertise = exports.getExpertiseById = exports.listExpertise = void 0;
const prisma_1 = require("../../../lib/prisma");
/**
 * Create slug from name
 */
function createSlug(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
/**
 * Create audit log entry
 */
async function createAuditLog(expertiseId, action, oldValue, newValue, userId) {
    await prisma_1.prisma.expertiseAuditLog.create({
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
const listExpertise = async (filters = {}) => {
    const { search, isActive, isDeleted = false, limit = 50, offset = 0 } = filters;
    const where = {
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
        prisma_1.prisma.expertiseCategory.findMany({
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
        prisma_1.prisma.expertiseCategory.count({ where })
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
exports.listExpertise = listExpertise;
/**
 * Get single expertise by ID
 */
const getExpertiseById = async (id) => {
    const expertise = await prisma_1.prisma.expertiseCategory.findUnique({
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
exports.getExpertiseById = getExpertiseById;
/**
 * Create new expertise category
 */
const createExpertise = async (data, userId) => {
    const slug = createSlug(data.name);
    // Check if already exists
    const existing = await prisma_1.prisma.expertiseCategory.findFirst({
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
    const expertise = await prisma_1.prisma.expertiseCategory.create({
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
exports.createExpertise = createExpertise;
/**
 * Update expertise category
 */
const updateExpertise = async (id, data, userId) => {
    const existing = await prisma_1.prisma.expertiseCategory.findUnique({
        where: { id }
    });
    if (!existing) {
        throw new Error('Expertise category not found');
    }
    // If name is being changed, check uniqueness
    if (data.name && data.name !== existing.name) {
        const slug = createSlug(data.name);
        const duplicate = await prisma_1.prisma.expertiseCategory.findFirst({
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
    const updated = await prisma_1.prisma.expertiseCategory.update({
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
exports.updateExpertise = updateExpertise;
/**
 * Soft delete expertise category
 */
const softDeleteExpertise = async (id, userId) => {
    const existing = await prisma_1.prisma.expertiseCategory.findUnique({
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
    const updated = await prisma_1.prisma.expertiseCategory.update({
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
exports.softDeleteExpertise = softDeleteExpertise;
/**
 * Restore deleted expertise
 */
const restoreExpertise = async (id, userId) => {
    const existing = await prisma_1.prisma.expertiseCategory.findUnique({
        where: { id }
    });
    if (!existing) {
        throw new Error('Expertise category not found');
    }
    if (!existing.isDeleted) {
        throw new Error('Expertise category is not deleted');
    }
    const updated = await prisma_1.prisma.expertiseCategory.update({
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
exports.restoreExpertise = restoreExpertise;
/**
 * Get usage stats for an expertise
 */
const getExpertiseUsageStats = async (id) => {
    const expertise = await prisma_1.prisma.expertiseCategory.findUnique({
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
exports.getExpertiseUsageStats = getExpertiseUsageStats;
/**
 * Migrate consultants from one expertise to another
 */
const migrateConsultants = async (fromId, toId, userId) => {
    const [fromExpertise, toExpertise] = await Promise.all([
        prisma_1.prisma.expertiseCategory.findUnique({ where: { id: fromId } }),
        prisma_1.prisma.expertiseCategory.findUnique({ where: { id: toId } })
    ]);
    if (!fromExpertise || !toExpertise) {
        throw new Error('One or both expertise categories not found');
    }
    // Get all consultants with from expertise
    const consultantExpertise = await prisma_1.prisma.consultantExpertise.findMany({
        where: { expertiseId: fromId }
    });
    let migratedCount = 0;
    for (const ce of consultantExpertise) {
        // Check if consultant already has the target expertise
        const existing = await prisma_1.prisma.consultantExpertise.findUnique({
            where: {
                consultantId_expertiseId: {
                    consultantId: ce.consultantId,
                    expertiseId: toId
                }
            }
        });
        if (!existing) {
            // Create new association
            await prisma_1.prisma.consultantExpertise.create({
                data: {
                    consultantId: ce.consultantId,
                    expertiseId: toId
                }
            });
            migratedCount++;
        }
        // Delete old association
        await prisma_1.prisma.consultantExpertise.delete({
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
exports.migrateConsultants = migrateConsultants;
