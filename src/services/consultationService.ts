import { api } from './api';
import type { ConsultantProfile, ConsultationRequest, ChatChannel, ChatMessage, AvailabilitySlot } from '../types/consultation';

const BASE_URL = '/consultation';

export const consultationService = {
    // Consultant Management
    async listConsultants(filters?: {
        expertise?: string;
        minRating?: number;
        maxPrice?: number;
        featured?: boolean;
        status?: string;
    }) {
        const params = new URLSearchParams();
        if (filters?.expertise) params.append('expertise', filters.expertise);
        if (filters?.minRating) params.append('minRating', filters.minRating.toString());
        if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
        if (filters?.featured) params.append('featured', 'true');
        if (filters?.status) params.append('status', filters.status);

        const url = `${BASE_URL}/consultants${params.toString() ? `?${params}` : ''}`;

        const response = await api.get<{ success: boolean; data: ConsultantProfile[] }>(url);

        return response.data;
    },

    async getConsultant(id: string) {
        const response = await api.get<{ success: boolean; data: ConsultantProfile }>(
            `${BASE_URL}/consultants/${id}`
        );
        return response.data;
    },

    async createProfile(data: Partial<ConsultantProfile>) {
        const response = await api.post<{ success: boolean; data: ConsultantProfile }>(
            `${BASE_URL}/consultants/profile`,
            data
        );
        return response.data;
    },

    async updateProfile(data: Partial<ConsultantProfile>) {
        const response = await api.patch<{ success: boolean; data: ConsultantProfile }>(
            `${BASE_URL}/consultants/profile`,
            data
        );
        return response.data;
    },

    async getOwnProfile() {
        const response = await api.get<{ success: boolean; data: ConsultantProfile }>(
            `${BASE_URL}/consultants/profile/me`
        );
        return response.data;
    },

    // Alias for getConsultant to match component usage
    async getConsultantById(id: string) {
        return this.getConsultant(id);
    },

    async getAvailableSlots(consultantId: string, startDate: string, endDate: string) {
        const response = await api.get<{ success: boolean; data: AvailabilitySlot[] }>(
            `${BASE_URL}/consultants/${consultantId}/slots?startDate=${startDate}&endDate=${endDate}`
        );
        return response.data;
    },

    // Availability Management
    async getAvailability() {
        const response = await api.get<{ success: boolean; data: AvailabilitySlot[] }>(
            `${BASE_URL}/consultants/availability`
        );
        return response.data;
    },

    async addAvailability(data: Partial<AvailabilitySlot>) {
        const response = await api.post<{ success: boolean; data: AvailabilitySlot }>(
            `${BASE_URL}/consultants/availability`,
            data
        );
        return response.data;
    },

    async removeAvailability(id: string) {
        await api.delete(`${BASE_URL}/consultants/availability/${id}`);
    },

    // Booking Management
    async createRequest(data: Partial<ConsultationRequest>) {
        const response = await api.post<{ success: boolean; data: ConsultationRequest }>(
            `${BASE_URL}/requests`,
            data
        );
        return response.data;
    },

    async getRequests(role?: 'client' | 'consultant') {
        const params = role ? `?role=${role}` : '';
        const response = await api.get<{ success: boolean; data: ConsultationRequest[] }>(
            `${BASE_URL}/requests${params}`
        );
        return response.data;
    },

    async getRequestDetails(id: string) {
        const response = await api.get<{ success: boolean; data: ConsultationRequest }>(
            `${BASE_URL}/requests/${id}`
        );
        return response.data;
    },

    async acceptRequest(id: string, meetingData: { meetingUrl: string; meetingPlatform?: string }) {
        const response = await api.patch<{ success: boolean; data: ConsultationRequest }>(
            `${BASE_URL}/requests/${id}/accept`,
            meetingData
        );
        return response.data;
    },

    async rejectRequest(id: string, reason?: string) {
        const response = await api.patch<{ success: boolean; data: ConsultationRequest }>(
            `${BASE_URL}/requests/${id}/reject`,
            { reason }
        );
        return response.data;
    },

    async updateMeetingLink(id: string, meetingData: { meetingUrl: string; meetingPlatform?: string }) {
        const response = await api.patch<{ success: boolean; data: ConsultationRequest }>(
            `${BASE_URL}/requests/${id}/meeting-link`,
            meetingData
        );
        return response.data;
    },

    // Chat
    async getChannel(requestId: string) {
        const response = await api.get<{ success: boolean; data: ChatChannel }>(
            `${BASE_URL}/requests/${requestId}/chat`
        );
        return response.data;
    },

    async getChatHistory(channelId: string, limit = 50) {
        const response = await api.get<{ success: boolean; data: ChatMessage[] }>(
            `${BASE_URL}/chat/${channelId}/messages?limit=${limit}`
        );
        return response.data;
    },

    async getUnreadCount(channelId: string) {
        const response = await api.get<{ success: boolean; data: { count: number } }>(
            `${BASE_URL}/chat/${channelId}/unread`
        );
        return response.data.count;
    },

    // Admin Chat Monitoring
    async getAdminAllChannels() {
        const response = await api.get<{ success: boolean; data: any[] }>(
            `${BASE_URL}/admin/chat/channels`
        );
        return response.data;
    },

    async getAdminChatHistory(channelId: string) {
        const response = await api.get<{ success: boolean; data: ChatMessage[] }>(
            `${BASE_URL}/admin/chat/${channelId}/messages`
        );
        return response.data;
    },
};
