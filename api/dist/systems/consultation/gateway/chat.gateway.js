"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConsultationChatGateway = void 0;
const socket_io_1 = require("socket.io");
const chatService = __importStar(require("../services/chat.service"));
class ConsultationChatGateway {
    constructor(httpServer) {
        this.io = new socket_io_1.Server(httpServer, {
            cors: {
                origin: process.env.FRONTEND_URL || 'http://localhost:5173',
                credentials: true
            },
            path: '/consultation-chat'
        });
        this.setupEventHandlers();
    }
    setupEventHandlers() {
        this.io.on('connection', (socket) => {
            console.log(`[Chat] Client connected: ${socket.id}`);
            // Join consultation room
            socket.on('join_room', async (data) => {
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
                }
                catch (error) {
                    console.error('[Chat] Error joining room:', error);
                    socket.emit('error', { message: 'Failed to join room' });
                }
            });
            // Send message
            socket.on('send_message', async (data) => {
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
                }
                catch (error) {
                    console.error('[Chat] Error sending message:', error);
                    socket.emit('error', { message: 'Failed to send message' });
                }
            });
            // Typing indicator
            socket.on('typing_start', (data) => {
                socket.to(data.channelId).emit('user_typing', {
                    userId: data.userId,
                    userName: data.userName
                });
            });
            socket.on('typing_end', (data) => {
                socket.to(data.channelId).emit('user_stopped_typing', {
                    userId: data.userId
                });
            });
            // Mark messages as read
            socket.on('mark_read', async (data) => {
                try {
                    await chatService.markMessagesAsRead(data.messageIds, data.userId);
                    socket.to(data.channelId).emit('messages_read', {
                        userId: data.userId,
                        messageIds: data.messageIds
                    });
                }
                catch (error) {
                    console.error('[Chat] Error marking messages as read:', error);
                }
            });
            socket.on('disconnect', () => {
                console.log(`[Chat] Client disconnected: ${socket.id}`);
            });
        });
    }
    getIO() {
        return this.io;
    }
}
exports.ConsultationChatGateway = ConsultationChatGateway;
