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
exports.unarchiveRequest = exports.archiveRequest = exports.getAvailableSlots = exports.updateSessionNotes = exports.payRequest = exports.updateMeetingLink = exports.completeSession = exports.rejectRequest = exports.acceptRequest = exports.getRequestDetails = exports.getOwnRequests = exports.createRequest = void 0;
const bookingService = __importStar(require("../services/booking.service"));
/**
 * Client: Create consultation request
 */
const createRequest = async (req, res, next) => {
    try {
        const clientId = req.user.id;
        const requestData = req.body;
        const request = await bookingService.createConsultationRequest(clientId, requestData);
        res.status(201).json({
            success: true,
            data: request,
            message: 'Consultation request created'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createRequest = createRequest;
/**
 * Get user's consultation requests (client or consultant view)
 */
const getOwnRequests = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const { role } = req.query; // 'client' or 'consultant'
        const requests = await bookingService.getUserRequests(userId, role);
        res.json({
            success: true,
            data: requests
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getOwnRequests = getOwnRequests;
/**
 * Get request details
 */
const getRequestDetails = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const request = await bookingService.getRequestDetails(id, userId);
        res.json({
            success: true,
            data: request
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getRequestDetails = getRequestDetails;
/**
 * Consultant: Accept request
 */
const acceptRequest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
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
    }
    catch (error) {
        next(error);
    }
};
exports.acceptRequest = acceptRequest;
/**
 * Consultant: Reject request
 */
const rejectRequest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { reason } = req.body;
        const request = await bookingService.rejectRequest(id, userId, reason);
        res.json({
            success: true,
            data: request,
            message: 'Request rejected'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.rejectRequest = rejectRequest;
/**
 * Consultant: Complete session with notes
 */
const completeSession = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const { sessionNotes, recommendations } = req.body;
        if (!sessionNotes || !sessionNotes.trim()) {
            return res.status(400).json({
                success: false,
                message: 'Session notes are required'
            });
        }
        const request = await bookingService.completeSession(id, userId, {
            sessionNotes,
            recommendations
        });
        res.json({
            success: true,
            data: request,
            message: 'Session completed successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.completeSession = completeSession;
/**
 * Consultant: Update meeting link for approved request
 */
const updateMeetingLink = async (req, res) => {
    try {
        const result = await bookingService.updateMeetingLink(req.params.id, req.user.id, req.body);
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.updateMeetingLink = updateMeetingLink;
const payRequest = async (req, res) => {
    try {
        const result = await bookingService.payRequest(req.params.id, req.user.id, req.body.paymentMethod);
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.payRequest = payRequest;
const updateSessionNotes = async (req, res) => {
    try {
        const result = await bookingService.updateSessionNotes(req.params.id, req.user.id, req.body.notes);
        res.json({ success: true, data: result });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.updateSessionNotes = updateSessionNotes;
/**
 * Get available slots
 */
const getAvailableSlots = async (req, res) => {
    try {
        const { consultantId } = req.params;
        const { startDate, endDate } = req.query;
        if (!startDate || !endDate) {
            return res.status(400).json({ success: false, message: 'startDate and endDate are required' });
        }
        const slots = await bookingService.getAvailableSlots(consultantId, startDate, endDate);
        res.json({ success: true, data: slots });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.getAvailableSlots = getAvailableSlots;
/**
 * Archive a consultation request
 */
const archiveRequest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const request = await bookingService.archiveRequest(id, userId);
        res.json({
            success: true,
            data: request,
            message: 'Request archived successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.archiveRequest = archiveRequest;
/**
 * Unarchive a consultation request
 */
const unarchiveRequest = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.user.id;
        const request = await bookingService.unarchiveRequest(id, userId);
        res.json({
            success: true,
            data: request,
            message: 'Request unarchived successfully'
        });
    }
    catch (error) {
        next(error);
    }
};
exports.unarchiveRequest = unarchiveRequest;
