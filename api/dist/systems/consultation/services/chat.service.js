"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markMessagesAsRead = exports.createMessage = exports.verifyChannelAccess = exports.markAsRead = exports.sendMessage = exports.getChatDetails = void 0;
const prisma_1 = require("../../../lib/prisma");
const error_1 = require("../../../utils/error");
/**
 * Get chat details (Channel + Messages)
 * Auto-creates channel if allowed and missing.
 */
const getChatDetails = async (requestId, userId) => {
    const request = await prisma_1.prisma.consultationRequest.findUnique({
        where: { id: requestId },
        include: {
            consultant: { include: { user: true } }, // Need user.id
            client: true,
            chatChannel: {
                include: {
                    messages: {
                        orderBy: { createdAt: 'asc' },
                        include: {
                            sender: {
                                select: {
                                    id: true,
                                    fullName: true,
                                    profilePictureUrl: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });
    if (!request)
        throw new error_1.HttpError(404, 'Consultation request not found');
    // 1. Verify specific participant access
    const isClient = request.clientId === userId;
    const isConsultant = request.consultant.userId === userId;
    // Allow Admin to view (optional, but good for support)
    // For now strict participant check
    if (!isClient && !isConsultant) {
        throw new error_1.HttpError(403, 'You are not a participant in this consultation');
    }
    // 2. Auto-create channel if missing (and status allows)
    // Actually, we can just return what we have. If no channel, UI shows empty.
    // But to store messages, we need a channel.
    let channel = request.chatChannel;
    // Status check for *creating* channel? 
    // Maybe we only create channel if status is Approved?
    // If pending, we return null channel? 
    // Plan said: "Pending = NO Chat". So returning null channel is fine.
    // However, if we want to show "Chat is locked", we might need to return the request status.
    // The controller will likely return the whole object properly.
    return {
        requestStatus: request.status,
        channel: channel,
        canChat: ['approved', 'scheduled', 'ongoing', 'completed'].includes(request.status.toLowerCase())
    };
};
exports.getChatDetails = getChatDetails;
/**
 * Send a message to a request's chat channel
 */
const sendMessage = async (data) => {
    // 1. Get request & channel
    const request = await prisma_1.prisma.consultationRequest.findUnique({
        where: { id: data.requestId },
        include: {
            chatChannel: true,
            consultant: true
        }
    });
    if (!request)
        throw new error_1.HttpError(404, 'Request not found');
    // 2. Participant Check
    const isClient = request.clientId === data.senderId;
    const isConsultant = request.consultant.userId === data.senderId;
    if (!isClient && !isConsultant) {
        throw new error_1.HttpError(403, 'Unauthorized');
    }
    // 3. Status Access Control
    const allowedStatuses = ['approved', 'scheduled', 'ongoing', 'completed'];
    if (!allowedStatuses.includes(request.status.toLowerCase())) {
        throw new error_1.HttpError(403, `Chat is not available for ${request.status} requests`);
    }
    // 4. Get or Create Channel
    let channelId = request.chatChannel?.id;
    if (!channelId) {
        const newChannel = await prisma_1.prisma.chatChannel.create({
            data: { requestId: data.requestId }
        });
        channelId = newChannel.id;
    }
    // 5. Create Message
    const contentType = data.fileUrl ? (data.fileUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? 'image' : 'file') : 'text';
    const message = await prisma_1.prisma.chatMessage.create({
        data: {
            channelId,
            senderId: data.senderId,
            content: data.content,
            contentType,
            fileUrl: data.fileUrl
        },
        include: {
            sender: {
                select: {
                    id: true,
                    fullName: true,
                    profilePictureUrl: true
                }
            }
        }
    });
    return message;
};
exports.sendMessage = sendMessage;
/**
 * Mark all messages in a channel as read by user
 */
const markAsRead = async (requestId, userId) => {
    const channel = await prisma_1.prisma.chatChannel.findUnique({
        where: { requestId }
    });
    if (!channel)
        return;
    await prisma_1.prisma.chatMessage.updateMany({
        where: {
            channelId: channel.id,
            senderId: { not: userId },
            isRead: false
        },
        data: {
            isRead: true,
            readAt: new Date()
        }
    });
};
exports.markAsRead = markAsRead;
// ==========================================
// GATEWAY COMPATIBILITY METHODS
// ==========================================
/**
 * Verify access by channel ID (used by Gateway)
 */
const verifyChannelAccess = async (channelId, userId) => {
    const channel = await prisma_1.prisma.chatChannel.findUnique({
        where: { id: channelId },
        include: {
            request: {
                include: { consultant: true }
            }
        }
    });
    if (!channel?.request)
        return false;
    const request = channel.request;
    const isClient = request.clientId === userId;
    const isConsultant = request.consultant.userId === userId;
    if (!isClient && !isConsultant)
        return false;
    // Check status
    return ['approved', 'scheduled', 'ongoing', 'completed'].includes(request.status.toLowerCase());
};
exports.verifyChannelAccess = verifyChannelAccess;
/**
 * Create message directly from Gateway (using channelId)
 */
const createMessage = async (data) => {
    return prisma_1.prisma.chatMessage.create({
        data: {
            channelId: data.channelId,
            senderId: data.senderId,
            content: data.content,
            contentType: data.contentType || 'text',
            fileUrl: data.fileUrl
        },
        include: {
            sender: {
                select: {
                    id: true,
                    fullName: true,
                    profilePictureUrl: true
                }
            }
        }
    });
};
exports.createMessage = createMessage;
/**
 * Mark specific messages as read (used by Gateway)
 */
const markMessagesAsRead = async (messageIds, userId) => {
    if (!messageIds.length)
        return;
    await prisma_1.prisma.chatMessage.updateMany({
        where: {
            id: { in: messageIds },
            senderId: { not: userId } // Only mark others' messages
        },
        data: {
            isRead: true,
            readAt: new Date()
        }
    });
};
exports.markMessagesAsRead = markMessagesAsRead;
