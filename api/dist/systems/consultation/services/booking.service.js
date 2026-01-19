"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unarchiveRequest = exports.archiveRequest = exports.getAvailableSlots = exports.updateSessionNotes = exports.payRequest = exports.updateMeetingLink = exports.completeSession = exports.rejectRequest = exports.acceptRequest = exports.getRequestDetails = exports.getUserRequests = exports.createConsultationRequest = void 0;
const client_1 = require("../../../../prisma/generated/client");
const prisma = new client_1.PrismaClient();
/**
 * Create consultation request
 */
const createConsultationRequest = async (clientId, data) => {
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
exports.createConsultationRequest = createConsultationRequest;
/**
 * Get user's requests (as client or consultant)
 */
const getUserRequests = async (userId, role) => {
    if (role === 'consultant') {
        // Get consultant profile first
        const profile = await prisma.consultantProfile.findUnique({
            where: { userId }
        });
        if (!profile) {
            return [];
        }
        const requests = await prisma.consultationRequest.findMany({
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
                type: true,
                chatChannel: {
                    include: {
                        messages: {
                            where: {
                                isRead: false,
                                senderId: { not: userId }
                            },
                            select: { id: true }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        return requests.map(req => ({
            ...req,
            unreadCount: req.chatChannel?.messages?.length || 0
        }));
    }
    // Default: Get as client
    const requests = await prisma.consultationRequest.findMany({
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
            type: true,
            chatChannel: {
                include: {
                    messages: {
                        where: {
                            isRead: false,
                            senderId: { not: userId }
                        },
                        select: { id: true }
                    }
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
    return requests.map(req => ({
        ...req,
        unreadCount: req.chatChannel?.messages?.length || 0
    }));
};
exports.getUserRequests = getUserRequests;
/**
 * Get request details with authorization check
 */
const getRequestDetails = async (requestId, userId) => {
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
exports.getRequestDetails = getRequestDetails;
/**
 * Consultant: Accept request
 */
const acceptRequest = async (requestId, consultantUserId, meetingDetails) => {
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
exports.acceptRequest = acceptRequest;
/**
 * Consultant: Reject request
 */
const rejectRequest = async (requestId, consultantUserId, reason) => {
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
exports.rejectRequest = rejectRequest;
/**
 * Consultant: Complete session with notes
 */
const completeSession = async (requestId, consultantUserId, data) => {
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
exports.completeSession = completeSession;
/**
 * Update meeting link
 */
const updateMeetingLink = async (requestId, consultantUserId, meetingDetails) => {
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
exports.updateMeetingLink = updateMeetingLink;
/**
 * Process payment (Manual/Mock)
 */
const payRequest = async (requestId, userId, // Client paying
paymentMethod = 'manual_transfer') => {
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
exports.payRequest = payRequest;
/**
 * Update session notes
 */
const updateSessionNotes = async (requestId, consultantUserId, notes) => {
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
exports.updateSessionNotes = updateSessionNotes;
/**
 * Get available slots for a consultant
 */
const getAvailableSlots = async (consultantId, startDate, endDate) => {
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
    const slots = [];
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
                if (slotEnd > ruleEnd)
                    break;
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
exports.getAvailableSlots = getAvailableSlots;
/**
 * Archive a consultation request
 */
const archiveRequest = async (requestId, userId) => {
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
exports.archiveRequest = archiveRequest;
/**
 * Unarchive a consultation request
 */
const unarchiveRequest = async (requestId, userId) => {
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
exports.unarchiveRequest = unarchiveRequest;
