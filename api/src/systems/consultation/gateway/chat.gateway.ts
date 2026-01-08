import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import * as chatService from '../services/chat.service';

export class ConsultationChatGateway {
    private io: SocketIOServer;

    constructor(httpServer: HTTPServer) {
        this.io = new SocketIOServer(httpServer, {
            cors: {
                origin: process.env.FRONTEND_URL || 'http://localhost:5173',
                credentials: true
            },
            path: '/consultation-chat'
        });

        this.setupEventHandlers();
    }

    private setupEventHandlers() {
        this.io.on('connection', (socket: Socket) => {
            console.log(`[Chat] Client connected: ${socket.id}`);

            // Join consultation room
            socket.on('join_room', async (data: { channelId: string; userId: string }) => {
                try {
                    const { channelId, userId } = data;

                    // Verify user has access to this channel
                    const hasAccess = await chatService.verifyChannelAccess(channelId, userId);

                    if (!hasAccess) {
                        socket.emit('error', { message: 'Unauthorized access to channel' });
                        return;
                    }

                    socket.join(channelId);
                    socket.emit('joined_room', { channelId });

                    console.log(`[Chat] User ${userId} joined channel ${channelId}`);
                } catch (error) {
                    console.error('[Chat] Error joining room:', error);
                    socket.emit('error', { message: 'Failed to join room' });
                }
            });

            // Send message
            socket.on('send_message', async (data: {
                channelId: string;
                userId: string;
                content: string;
                contentType?: string;
            }) => {
                try {
                    const { channelId, userId, content, contentType } = data;

                    // Verify access
                    const hasAccess = await chatService.verifyChannelAccess(channelId, userId);
                    if (!hasAccess) {
                        socket.emit('error', { message: 'Unauthorized' });
                        return;
                    }

                    // Save message to database
                    const message = await chatService.createMessage({
                        channelId,
                        senderId: userId,
                        content,
                        contentType: contentType || 'text'
                    });

                    // Broadcast to room
                    this.io.to(channelId).emit('new_message', message);

                    socket.emit('message_sent', { messageId: message.id });
                } catch (error) {
                    console.error('[Chat] Error sending message:', error);
                    socket.emit('error', { message: 'Failed to send message' });
                }
            });

            // Typing indicator
            socket.on('typing_start', (data: { channelId: string; userId: string; userName: string }) => {
                socket.to(data.channelId).emit('user_typing', {
                    userId: data.userId,
                    userName: data.userName
                });
            });

            socket.on('typing_end', (data: { channelId: string; userId: string }) => {
                socket.to(data.channelId).emit('user_stopped_typing', {
                    userId: data.userId
                });
            });

            // Mark messages as read
            socket.on('mark_read', async (data: { channelId: string; userId: string; messageIds: string[] }) => {
                try {
                    await chatService.markMessagesAsRead(data.messageIds, data.userId);
                    socket.to(data.channelId).emit('messages_read', {
                        userId: data.userId,
                        messageIds: data.messageIds
                    });
                } catch (error) {
                    console.error('[Chat] Error marking messages as read:', error);
                }
            });

            socket.on('disconnect', () => {
                console.log(`[Chat] Client disconnected: ${socket.id}`);
            });
        });
    }

    public getIO(): SocketIOServer {
        return this.io;
    }
}
