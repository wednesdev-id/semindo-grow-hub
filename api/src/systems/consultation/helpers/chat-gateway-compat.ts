
// ==========================================
// GATEWAY COMPATIBILITY METHODS
// ==========================================

/**
 * Verify access by channel ID (used by Gateway)
 */
export const verifyChannelAccess = async (channelId: string, userId: string) => {
    const channel = await prisma.chatChannel.findUnique({
        where: { id: channelId },
        include: {
            request: {
                include: { consultant: true }
            }
        }
    });

    if (!channel?.request) return false;

    const request = channel.request;
    const isClient = request.clientId === userId;
    const isConsultant = request.consultant.userId === userId;

    if (!isClient && !isConsultant) return false;

    // Check status
    return ['approved', 'scheduled', 'ongoing', 'completed'].includes(request.status.toLowerCase());
};

/**
 * Create message directly from Gateway (using channelId)
 */
export const createMessage = async (data: {
    channelId: string;
    senderId: string;
    content: string;
    contentType?: string;
    fileUrl?: string
}) => {
    return prisma.chatMessage.create({
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

/**
 * Mark specific messages as read (used by Gateway)
 */
export const markMessagesAsRead = async (messageIds: string[], userId: string) => {
    if (!messageIds.length) return;

    await prisma.chatMessage.updateMany({
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
