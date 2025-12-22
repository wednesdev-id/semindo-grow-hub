import { Request, Response, NextFunction } from 'express';
import * as bookingService from '../services/booking.service';

/**
 * Client: Create consultation request
 */
export const createRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const clientId = (req as any).user.id;
        const requestData = req.body;

        const request = await bookingService.createConsultationRequest(clientId, requestData);

        res.status(201).json({
            success: true,
            data: request,
            message: 'Consultation request created'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get user's consultation requests (client or consultant view)
 */
export const getOwnRequests = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = (req as any).user.id;
        const { role } = req.query; // 'client' or 'consultant'

        const requests = await bookingService.getUserRequests(userId, role as string);

        res.json({
            success: true,
            data: requests
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get request details
 */
export const getRequestDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;

        const request = await bookingService.getRequestDetails(id, userId);

        res.json({
            success: true,
            data: request
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Consultant: Accept request
 */
export const acceptRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;
        const { meetingUrl, meetingPlatform } = req.body;

        const request = await bookingService.acceptRequest(id, userId, {
            meetingUrl,
            meetingPlatform
        });

        res.json({
            success: true,
            data: request,
            message: 'Request accepted successfully'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Consultant: Reject request
 */
export const rejectRequest = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { id } = req.params;
        const userId = (req as any).user.id;
        const { reason } = req.body;

        const request = await bookingService.rejectRequest(id, userId, reason);

        res.json({
            success: true,
            data: request,
            message: 'Request rejected'
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Consultant: Update meeting link for approved request
 */
export const updateMeetingLink = async (req: Request, res: Response) => {
    try {
        const result = await bookingService.updateMeetingLink(
            req.params.id,
            (req as any).user.id,
            req.body
        );
        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const payRequest = async (req: Request, res: Response) => {
    try {
        const result = await bookingService.payRequest(
            req.params.id,
            (req as any).user.id,
            req.body.paymentMethod
        );
        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

export const updateSessionNotes = async (req: Request, res: Response) => {
    try {
        const result = await bookingService.updateSessionNotes(
            req.params.id,
            (req as any).user.id,
            req.body.notes
        );
        res.json({ success: true, data: result });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};

/**
 * Get available slots
 */
export const getAvailableSlots = async (req: Request, res: Response) => {
    try {
        const { consultantId } = req.params;
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, message: 'startDate and endDate are required' });
        }

        const slots = await bookingService.getAvailableSlots(
            consultantId,
            startDate as string,
            endDate as string
        );
        res.json({ success: true, data: slots });
    } catch (error: any) {
        res.status(400).json({ success: false, message: error.message });
    }
};
