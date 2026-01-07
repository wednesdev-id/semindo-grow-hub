import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface ConsultationRequestData {
    consultantId: string;
    typeId?: string;
    requestedDate: string;
    requestedStartTime: string;
    requestedEndTime: string;
    durationMinutes: number;
    topic: string;
    description?: string;
    timezone?: string;
}

/**
 * Create consultation request
 */
export const createConsultationRequest = async (clientId: string, data: ConsultationRequestData) => {
    // Verify consultant exists and is approved
    const consultant = await prisma.consultantProfile.findUnique({
        where: { id: data.consultantId }
    });

    if (!consultant) {
        throw new Error('Consultant not found');
    }

    if (consultant.status !== 'approved') {
        throw new Error('Consultant is not available for bookings');
    }

    // Create request and chat channel in a transaction
    const request = await prisma.consultationRequest.create({
        data: {
            clientId,
            consultantId: data.consultantId,
            typeId: data.typeId,
            requestedDate: new Date(data.requestedDate),
            requestedStartTime: new Date(`1970-01-01T${data.requestedStartTime}`),
            requestedEndTime: new Date(`1970-01-01T${data.requestedEndTime}`),
            durationMinutes: data.durationMinutes,
            topic: data.topic,
            description: data.description,
            timezone: data.timezone || 'Asia/Jakarta',
            status: 'pending',
            // Auto-create chat channel
            chatChannel: {
                create: {
                    isActive: true
                }
            }
        },
        include: {
            consultant: {
                include: {
                    user: {
                        select: {
                            fullName: true,
                            email: true
                        }
                    }
                }
            },
            chatChannel: true
        }
    });

    // TODO: Send notification to consultant

    return request;
};

/**
 * Get user's requests (as client or consultant)
 */
export const getUserRequests = async (userId: string, role?: string) => {
    if (role === 'consultant') {
        // Get consultant profile first
        const profile = await prisma.consultantProfile.findUnique({
            where: { userId }
        });

        if (!profile) {
            return [];
        }

        return await prisma.consultationRequest.findMany({
            where: {
                consultantId: profile.id
            },
            include: {
                client: {
                    select: {
                        fullName: true,
                        email: true,
                        phone: true,
                        profilePictureUrl: true
                    }
                },
                consultant: {
                    include: {
                        user: {
                            select: {
                                fullName: true,
                                profilePictureUrl: true
                            }
                        }
                    }
                },
                type: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    // Default: Get as client
    return await prisma.consultationRequest.findMany({
        where: {
            clientId: userId
        },
        include: {
            consultant: {
                include: {
                    user: {
                        select: {
                            fullName: true,
                            profilePictureUrl: true
                        }
                    },
                    expertise: {
                        include: {
                            expertise: true
                        }
                    },
                    packages: {
                        where: { isActive: true },
                        orderBy: { sortOrder: 'asc' }
                    }
                }
            },
            type: true
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
};

/**
 * Get request details with authorization check
 */
export const getRequestDetails = async (requestId: string, userId: string) => {
    const request = await prisma.consultationRequest.findUnique({
        where: { id: requestId },
        include: {
            client: {
                select: {
                    id: true,
                    fullName: true,
                    email: true,
                    phone: true
                }
            },
            consultant: {
                include: {
                    user: {
                        select: {
                            id: true,
                            fullName: true,
                            email: true
                        }
                    }
                }
            },
            type: true,
            chatChannel: {
                include: {
                    messages: {
                        orderBy: {
                            createdAt: 'asc'
                        },
                        take: 50
                    }
                }
            },
            sessionFiles: true
        }
    });

    if (!request) {
        throw new Error('Request not found');
    }

    // Authorization check
    const isClient = request.clientId === userId;
    const isConsultant = request.consultant.userId === userId;

    if (!isClient && !isConsultant) {
        throw new Error('Unauthorized to view this request');
    }

    return request;
};

/**
 * Consultant: Accept request
 */
export const acceptRequest = async (
    requestId: string,
    consultantUserId: string,
    meetingDetails: { meetingUrl?: string; meetingPlatform?: string }
) => {
    // Verify consultant owns this request
    const request = await prisma.consultationRequest.findUnique({
        where: { id: requestId },
        include: {
            consultant: {
                select: {
                    userId: true
                }
            }
        }
    });

    if (!request) {
        throw new Error('Request not found');
    }

    if (request.consultant.userId !== consultantUserId) {
        throw new Error('Unauthorized');
    }

    if (request.status !== 'pending') {
        throw new Error(`Cannot accept request with status: ${request.status}`);
    }

    return await prisma.consultationRequest.update({
        where: { id: requestId },
        data: {
            status: 'approved',
            meetingUrl: meetingDetails.meetingUrl,
            meetingPlatform: meetingDetails.meetingPlatform
        }
    });

    // TODO: Send notification to client
};

/**
 * Consultant: Reject request
 */
export const rejectRequest = async (
    requestId: string,
    consultantUserId: string,
    reason?: string
) => {
    const request = await prisma.consultationRequest.findUnique({
        where: { id: requestId },
        include: {
            consultant: {
                select: {
                    userId: true
                }
            }
        }
    });

    if (!request) {
        throw new Error('Request not found');
    }

    if (request.consultant.userId !== consultantUserId) {
        throw new Error('Unauthorized');
    }

    if (request.status !== 'pending') {
        throw new Error(`Cannot reject request with status: ${request.status}`);
    }

    return await prisma.consultationRequest.update({
        where: { id: requestId },
        data: {
            status: 'rejected',
            statusReason: reason
        }
    });

    // TODO: Send notification to client
};

/**
 * Consultant: Complete session with notes
 */
export const completeSession = async (
    requestId: string,
    consultantUserId: string,
    data: { sessionNotes: string; recommendations?: string }
) => {
    const request = await prisma.consultationRequest.findUnique({
        where: { id: requestId },
        include: {
            consultant: {
                select: {
                    userId: true
                }
            }
        }
    });

    if (!request) {
        throw new Error('Request not found');
    }

    if (request.consultant.userId !== consultantUserId) {
        throw new Error('Unauthorized');
    }

    if (request.status !== 'approved') {
        throw new Error(`Cannot complete session with status: ${request.status}`);
    }

    return await prisma.consultationRequest.update({
        where: { id: requestId },
        data: {
            status: 'completed',
            sessionNotes: data.sessionNotes,
            // Store recommendations in statusReason field as workaround
            // In production, you might want a dedicated field
            statusReason: data.recommendations
        }
    });

    // TODO: Send completion notification to client
    // TODO: Unlock review/rating feature for client
};

/**
 * Update meeting link
 */
export const updateMeetingLink = async (
    requestId: string,
    consultantUserId: string,
    meetingDetails: { meetingUrl: string; meetingPlatform?: string }
) => {
    const request = await prisma.consultationRequest.findUnique({
        where: { id: requestId },
        include: {
            consultant: {
                select: {
                    userId: true
                }
            }
        }
    });

    if (!request) {
        throw new Error('Request not found');
    }

    if (request.consultant.userId !== consultantUserId) {
        throw new Error('Unauthorized');
    }

    return await prisma.consultationRequest.update({
        where: { id: requestId },
        data: {
            meetingUrl: meetingDetails.meetingUrl,
            meetingPlatform: meetingDetails.meetingPlatform || 'other'
        }
    });

    // TODO: Notify client of meeting link update
};

/**
 * Process payment (Manual/Mock)
 */
export const payRequest = async (
    requestId: string,
    userId: string, // Client paying
    paymentMethod: string = 'manual_transfer'
) => {
    const request = await prisma.consultationRequest.findUnique({
        where: { id: requestId }
    });

    if (!request) {
        throw new Error('Request not found');
    }

    if (request.clientId !== userId) {
        throw new Error('Unauthorized');
    }

    // In a real system, you'd create a Transaction/Payment record here
    // For MVP Manual Transfer, we just mark it as paid
    return await prisma.consultationRequest.update({
        where: { id: requestId },
        data: {
            isPaid: true,
            status: 'approved' // Ensure it stays approved (or moves to approved if waiting payment)
        }
    });
};

/**
 * Update session notes
 */
export const updateSessionNotes = async (
    requestId: string,
    consultantUserId: string,
    notes: string
) => {
    const request = await prisma.consultationRequest.findUnique({
        where: { id: requestId },
        include: {
            consultant: {
                select: { userId: true }
            }
        }
    });

    if (!request) {
        throw new Error('Request not found');
    }

    if (request.consultant.userId !== consultantUserId) {
        throw new Error('Unauthorized');
    }

    return await prisma.consultationRequest.update({
        where: { id: requestId },
        data: {
            sessionNotes: notes
        }
    });
};

/**
 * Get available slots for a consultant
 */
export const getAvailableSlots = async (
    consultantId: string,
    startDate: string,
    endDate: string
) => {
    // 1. Get Consultant Availability
    const availability = await prisma.consultantAvailability.findMany({
        where: {
            consultantId: consultantId,
            isAvailable: true
        }
    });

    // 2. Get Existing Bookings (Approved or Pending)
    const start = new Date(startDate);
    const end = new Date(endDate);

    const bookings = await prisma.consultationRequest.findMany({
        where: {
            consultantId: consultantId,
            status: { in: ['pending', 'approved'] },
            requestedDate: {
                gte: start,
                lte: end
            }
        }
    });

    // 3. Generate Slots
    const slots: { date: string; startTime: string; endTime: string; status: string; }[] = [];
    const current = new Date(start);

    // Iterasi per hari
    while (current <= end) {
        const dayOfWeek = current.getDay();
        const dateString = current.toISOString().split('T')[0];

        // Find relevant availability rules
        const dayRules = availability.filter(rule => {
            if (rule.specificDate) {
                return rule.specificDate.toISOString().split('T')[0] === dateString;
            }
            return rule.isRecurring && rule.dayOfWeek === dayOfWeek;
        });

        for (const rule of dayRules) {
            // Convert rule times to today's date context
            const ruleStart = new Date(`${dateString}T${rule.startTime.toISOString().split('T')[1]}`);
            const ruleEnd = new Date(`${dateString}T${rule.endTime.toISOString().split('T')[1]}`);

            // Generate hourly slots (Default 60 mins for now)
            let slotStart = new Date(ruleStart);
            while (slotStart < ruleEnd) {
                const slotEnd = new Date(slotStart.getTime() + 60 * 60000); // +60 mins

                if (slotEnd > ruleEnd) break;

                // Check conflict with bookings
                const isBooked = bookings.some(booking => {
                    const bookingStart = new Date(`${booking.requestedDate.toISOString().split('T')[0]}T${booking.requestedStartTime.toISOString().split('T')[1]}`);
                    const bookingEnd = new Date(`${booking.requestedDate.toISOString().split('T')[0]}T${booking.requestedEndTime.toISOString().split('T')[1]}`);

                    // Simple overlap check
                    return (slotStart < bookingEnd && slotEnd > bookingStart);
                });

                if (!isBooked) {
                    slots.push({
                        date: dateString,
                        startTime: slotStart.toTimeString().slice(0, 5),
                        endTime: slotEnd.toTimeString().slice(0, 5),
                        status: 'available'
                    });
                }

                slotStart = slotEnd;
            }
        }

        current.setDate(current.getDate() + 1);
    }

    return slots;
};

/**
 * Archive a consultation request
 */
export const archiveRequest = async (requestId: string, userId: string) => {
    const request = await prisma.consultationRequest.findUnique({
        where: { id: requestId },
        include: {
            consultant: {
                select: { userId: true }
            }
        }
    });

    if (!request) {
        throw new Error('Request not found');
    }

    // Only consultant or client can archive
    const isClient = request.clientId === userId;
    const isConsultant = request.consultant.userId === userId;

    if (!isClient && !isConsultant) {
        throw new Error('Unauthorized');
    }

    // Can only archive completed, rejected, or cancelled requests
    if (!['completed', 'rejected', 'cancelled'].includes(request.status)) {
        throw new Error('Can only archive completed, rejected, or cancelled requests');
    }

    return await prisma.consultationRequest.update({
        where: { id: requestId },
        data: {
            isArchived: true,
            archivedAt: new Date()
        }
    });
};

/**
 * Unarchive a consultation request
 */
export const unarchiveRequest = async (requestId: string, userId: string) => {
    const request = await prisma.consultationRequest.findUnique({
        where: { id: requestId },
        include: {
            consultant: {
                select: { userId: true }
            }
        }
    });

    if (!request) {
        throw new Error('Request not found');
    }

    // Only consultant or client can unarchive
    const isClient = request.clientId === userId;
    const isConsultant = request.consultant.userId === userId;

    if (!isClient && !isConsultant) {
        throw new Error('Unauthorized');
    }

    return await prisma.consultationRequest.update({
        where: { id: requestId },
        data: {
            isArchived: false,
            archivedAt: null
        }
    });
};
