"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markMessagesAsRead = exports.createMessage = exports.verifyChannelAccess = void 0;
const prisma_1 = require("../../../lib/prisma");
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
