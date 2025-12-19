import { Request, Response, NextFunction } from 'express';
import * as chatService from '../services/chat.service';

/**
 * Get chat history for a channel
 */
export const getChatHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { channelId } = req.params;
        const userId = (req as any).user.id;
        const limit = req.query.limit ? Number(req.query.limit) : 50;

        const messages = await chatService.getChatHistory(channelId, userId, limit);

        res.json({
            success: true,
            data: messages
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get or create channel for a consultation request
 */
export const getOrCreateChannel = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { requestId } = req.params;
        const userId = (req as any).user.id;

        const channel = await chatService.getOrCreateChannel(requestId);

        // Verify user has access
        const hasAccess = await chatService.verifyChannelAccess(channel.id, userId);
        if (!hasAccess) {
            return res.status(403).json({
                success: false,
                error: 'Unauthorized'
            });
        }

        res.json({
            success: true,
            data: channel
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get unread message count
 */
export const getUnreadCount = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { channelId } = req.params;
        const userId = (req as any).user.id;

        const count = await chatService.getUnreadCount(channelId, userId);

        res.json({
            success: true,
            data: { count }
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Upload file to chat (multipart/form-data)
 */
export const uploadFile = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { channelId } = req.params;
        const userId = (req as any).user.id;

        // Check if file was uploaded
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        const message = await chatService.uploadChatFile(channelId, userId, {
            fileName: req.file.originalname,
            fileUrl: `/uploads/chat/${req.file.filename}`,
            mimeType: req.file.mimetype
        });

        res.json({
            success: true,
            data: message
        });
    } catch (error) {
        next(error);
    }
};

// ============================================
// ADMIN HANDLERS
// ============================================

/**
 * Admin: Get all channels
 */
export const getAdminChannels = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const channels = await chatService.getAdminAllChannels();
        res.json({
            success: true,
            data: channels
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Admin: Get chat history
 */
export const getAdminChatHistory = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { channelId } = req.params;
        const messages = await chatService.getAdminChatHistory(channelId);
        res.json({
            success: true,
            data: messages
        });
    } catch (error) {
        next(error);
    }
};
