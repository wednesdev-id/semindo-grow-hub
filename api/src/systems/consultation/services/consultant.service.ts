import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ListConsultantsFilters {
    expertise?: string;
    minRating?: number;
    maxPrice?: number;
    featured?: boolean;
    status?: string;
}

/**
 * List consultants with filters (Public)
 */
export const listConsultants = async (filters: ListConsultantsFilters) => {
    const where: any = {};

    if (filters.status) {
        if (filters.status !== 'all') {
            where.status = filters.status;
        }
    } else {
        where.status = 'approved';
    }

    if (filters.expertise) {
        where.expertiseAreas = {
            has: filters.expertise
        };
    }

    if (filters.minRating) {
        where.averageRating = {
            gte: filters.minRating
        };
    }

    if (filters.maxPrice) {
        where.hourlyRate = {
            lte: filters.maxPrice
        };
    }

    if (filters.featured) {
        where.isFeatured = true;
    }

    return await prisma.consultantProfile.findMany({
        where,
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    profilePictureUrl: true,
                    email: true,
                    phone: true,
                    businessName: true
                }
            },
            _count: {
                select: {
                    reviews: true
                }
            }
        },
        orderBy: [
            { isFeatured: 'desc' },
            { averageRating: 'desc' }
        ]
    });
};

/**
 * Get single consultant profile (Public)
 */
export const getConsultantProfile = async (consultantId: string) => {
    return await prisma.consultantProfile.findUnique({
        where: { id: consultantId },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    profilePictureUrl: true,
                    email: true
                }
            },
            availability: true,
            reviews: {
                where: { isPublished: true },
                include: {
                    client: {
                        select: {
                            fullName: true,
                            profilePictureUrl: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                },
                take: 10
            }
        }
    });
};

/**
 * Create consultant profile
 */
export const createConsultantProfile = async (userId: string, data: any) => {
    // Check if user already has a profile
    const existing = await prisma.consultantProfile.findUnique({
        where: { userId }
    });

    if (existing) {
        throw new Error('User already has a consultant profile');
    }

    return await prisma.consultantProfile.create({
        data: {
            userId,
            title: data.title,
            tagline: data.tagline,
            bio: data.bio,
            expertiseAreas: data.expertiseAreas || [],
            industries: data.industries || [],
            languages: data.languages || ['Indonesian'],
            yearsExperience: data.yearsExperience,
            certifications: data.certifications,
            education: data.education,
            hourlyRate: data.hourlyRate,
            status: 'pending' // Requires admin approval
        }
    });
};

/**
 * Update consultant profile
 */
export const updateConsultantProfile = async (userId: string, updates: any) => {
    const profile = await prisma.consultantProfile.findUnique({
        where: { userId }
    });

    if (!profile) {
        throw new Error('Consultant profile not found');
    }

    return await prisma.consultantProfile.update({
        where: { userId },
        data: {
            title: updates.title,
            tagline: updates.tagline,
            bio: updates.bio,
            expertiseAreas: updates.expertiseAreas,
            industries: updates.industries,
            languages: updates.languages,
            yearsExperience: updates.yearsExperience,
            certifications: updates.certifications,
            education: updates.education,
            hourlyRate: updates.hourlyRate,
            isAcceptingNewClients: updates.isAcceptingNewClients,
            cancellationPolicy: updates.cancellationPolicy
        }
    });
};

/**
 * Get consultant profile by user ID (for own profile with stats)
 */
export const getProfileByUserId = async (userId: string) => {
    const profile = await prisma.consultantProfile.findUnique({
        where: { userId },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    profilePictureUrl: true
                }
            },
            consultationType: true,
            availability: true,
            _count: {
                select: {
                    consultationRequests: true
                }
            }
        }
    });

    if (!profile) {
        return null;
    }

    // Calculate completed sessions
    const completedSessions = await prisma.consultationRequest.count({
        where: {
            consultantId: profile.id,
            status: 'COMPLETED'
        }
    });

    return {
        ...profile,
        stats: {
            averageRating: profile.averageRating || 0,
            completedSessions: completedSessions,
            totalRequests: profile._count?.consultationRequests || 0
        }
    };
};

/**
 * Get consultant availability
 */
export const getConsultantAvailability = async (userId: string) => {
    const profile = await prisma.consultantProfile.findUnique({
        where: { userId },
        include: { availability: true }
    });

    if (!profile) {
        throw new Error('Consultant profile not found');
    }

    console.log(`[Service] Found availability for user ${userId}:`, profile.availability.length, 'slots');
    return profile.availability;
};

/**
 * Add availability slot
 */
export const addAvailabilitySlot = async (userId: string, slotData: any) => {
    const profile = await prisma.consultantProfile.findUnique({
        where: { userId }
    });

    if (!profile) {
        throw new Error('Consultant profile not found');
    }

    // Convert time strings (HH:mm) to Date objects
    // Prisma requires a Date object for DateTime fields, even if mapped to @db.Time
    const today = new Date().toISOString().split('T')[0];
    const baseDate = slotData.specificDate ? new Date(slotData.specificDate).toISOString().split('T')[0] : today;

    const startTimeDate = new Date(`${baseDate}T${slotData.startTime}:00`);
    const endTimeDate = new Date(`${baseDate}T${slotData.endTime}:00`);

    const newSlot = await prisma.consultantAvailability.create({
        data: {
            consultantId: profile.id,
            dayOfWeek: slotData.dayOfWeek,
            startTime: startTimeDate,
            endTime: endTimeDate,
            isRecurring: slotData.isRecurring ?? true,
            specificDate: slotData.specificDate ? new Date(slotData.specificDate) : null,
            isAvailable: slotData.isAvailable ?? true,
            timezone: slotData.timezone || 'Asia/Jakarta'
        }
    });

    console.log('[Service] Created newly slot:', newSlot);
    return newSlot;
};

/**
 * Remove availability slot
 */
export const removeAvailabilitySlot = async (userId: string, slotId: string) => {
    const profile = await prisma.consultantProfile.findUnique({
        where: { userId }
    });

    if (!profile) {
        throw new Error('Consultant profile not found');
    }

    // Verify slot belongs to this consultant
    const slot = await prisma.consultantAvailability.findFirst({
        where: {
            id: slotId,
            consultantId: profile.id
        }
    });

    if (!slot) {
        throw new Error('Availability slot not found or unauthorized');
    }

    return await prisma.consultantAvailability.delete({
        where: { id: slotId }
    });
};

/**
 * Admin: Approve consultant
 */
export const approveConsultant = async (consultantId: string, adminId: string) => {
    return await prisma.consultantProfile.update({
        where: { id: consultantId },
        data: {
            status: 'approved',
            verificationStatus: 'verified'
        }
    });
};

/**
 * Admin: Reject consultant
 */
export const rejectConsultant = async (consultantId: string, reason: string) => {
    return await prisma.consultantProfile.update({
        where: { id: consultantId },
        data: {
            status: 'rejected'
        }
    });
};

/**
 * Public: Get instructors (mentors + consultants who teach courses)
 */
export const getInstructors = async () => {
    // Get mentors (all mentors can teach)
    const mentors = await prisma.mentorProfile.findMany({
        where: {
            isVerified: true
        },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    profilePictureUrl: true
                }
            },
            courses: {
                where: { isPublished: true },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    thumbnail: true
                }
            }
        },
        orderBy: {
            rating: 'desc'
        }
    });

    // Get consultants who opted-in to teaching
    const consultants = await prisma.consultantProfile.findMany({
        where: {
            canTeachCourses: true,
            status: 'approved'
        },
        include: {
            user: {
                select: {
                    id: true,
                    fullName: true,
                    profilePictureUrl: true
                }
            },
            courses: {
                where: { isPublished: true },
                select: {
                    id: true,
                    title: true,
                    slug: true,
                    thumbnail: true
                }
            }
        },
        orderBy: {
            totalCoursesCreated: 'desc'
        }
    });

    // Merge and add type indicator
    return {
        mentors: mentors.map(m => ({
            ...m,
            type: 'mentor' as const,
            expertise: m.expertise,
            yearsExperience: m.experience
        })),
        consultants: consultants.map(c => ({
            ...c,
            type: 'consultant' as const,
            expertise: c.expertiseAreas,
            yearsExperience: c.yearsExperience
        }))
    };
};


