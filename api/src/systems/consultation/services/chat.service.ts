import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface CreateMessageData {
    channelId: string;
    senderId: string;
    content?: string;
    contentType: string;
    fileUrl?: string;
}

/**
 * Verify user has access to chat channel
 */
export const verifyChannelAccess = async (channelId: string, userId: string): Promise<boolean> => {
    const channel = await prisma.chatChannel.findUnique({
        where: { id: channelId },
        include: {
            request: {
                include: {
                    client: { select: { id: true } },
                    consultant: {
                        include: {
                            user: { select: { id: true } }
                        }
                    }
                }
            }
        }
    });

    if (!channel) {
        return false;
    }

    // User must be either the client or the consultant
    const isClient = channel.request.clientId === userId;
    const isConsultant = channel.request.consultant.userId === userId;

    return isClient || isConsultant;
};

/**
 * Create chat message
 */
export const createMessage = async (data: CreateMessageData) => {
    return await prisma.chatMessage.create({
        data: {
            channelId: data.channelId,
            senderId: data.senderId,
            content: data.content,
            contentType: data.contentType,
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

/**
 * Get chat history for a channel
 */
export const getChatHistory = async (channelId: string, userId: string, limit = 50) => {
    // Verify access first
    const hasAccess = await verifyChannelAccess(channelId, userId);
    if (!hasAccess) {
        throw new Error('Unauthorized access to channel');
    }

    return await prisma.chatMessage.findMany({
        where: { channelId },
        include: {
            sender: {
                select: {
                    id: true,
                    fullName: true,
                    profilePictureUrl: true
                }
            }
        },
        orderBy: {
            createdAt: 'asc'
        },
        take: limit
    });
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (messageIds: string[], userId: string) => {
    return await prisma.chatMessage.updateMany({
        where: {
            id: { in: messageIds },
            senderId: { not: userId }, // Don't mark own messages as read
            isRead: false
        },
        data: {
            isRead: true,
            readAt: new Date()
        }
    });
};

/**
 * Get unread message count for a channel
 */
export const getUnreadCount = async (channelId: string, userId: string) => {
    return await prisma.chatMessage.count({
        where: {
            channelId,
            senderId: { not: userId },
            isRead: false
        }
    });
};

/**
 * Get or create chat channel for a consultation request
 */
export const getOrCreateChannel = async (requestId: string) => {
    // Check if channel already exists
    let channel = await prisma.chatChannel.findUnique({
        where: { requestId }
    });

    if (!channel) {
        // Create new channel
        channel = await prisma.chatChannel.create({
            data: {
                requestId,
                isActive: true
            }
        });
    }

    return channel;
};

/**
 * Upload file to chat
 */
export const uploadChatFile = async (
    channelId: string,
    senderId: string,
    fileData: {
        fileName: string;
        fileUrl: string;
        mimeType: string;
    }
) => {
    // Verify access
    const hasAccess = await verifyChannelAccess(channelId, senderId);
    if (!hasAccess) {
        throw new Error('Unauthorized');
    }

    return await createMessage({
        channelId,
        senderId,
        content: fileData.fileName,
        contentType: 'file',
        fileUrl: fileData.fileUrl
    });
};

// ============================================
// ADMIN METHODS
// ============================================

/**
 * Admin: Get all chat channels
 */
export const getAdminAllChannels = async () => {
    return await prisma.chatChannel.findMany({
        include: {
            request: {
                include: {
                    client: {
                        select: {
                            fullName: true,
                            email: true
                        }
                    },
                    consultant: {
                        include: {
                            user: {
                                select: {
                                    fullName: true,
                                    email: true
                                }
                            }
                        }
                    }
                }
            },
            messages: {
                orderBy: {
                    createdAt: 'desc'
                },
                take: 1
            },
            _count: {
                select: {
                    messages: true
                }
            }
        },
        orderBy: {
            updatedAt: 'desc'
        }
    });
};

/**
 * Admin: Get chat history (Bypass participant check)
 */
export const getAdminChatHistory = async (channelId: string, limit = 100) => {
    return await prisma.chatMessage.findMany({
        where: { channelId },
        include: {
            sender: {
                select: {
                    id: true,
                    fullName: true,
                    profilePictureUrl: true,
                }
            }
        },
        orderBy: {
            createdAt: 'asc'
        },
        take: limit
    });
};
