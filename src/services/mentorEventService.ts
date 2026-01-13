import { api } from './api';

// ============================================
// TYPES
// ============================================

export interface MentorEvent {
    id: string;
    mentorId: string;
    title: string;
    slug: string;
    description: string;
    thumbnail?: string;
    province: string;
    city: string;
    venue?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    startDate: string;
    endDate: string;
    timezone: string;
    maxAttendees: number;
    registrationEnd?: string;
    type: 'workshop' | 'gathering' | 'training';
    status: 'draft' | 'published' | 'cancelled' | 'completed';
    tags: string[];
    createdAt: string;
    updatedAt: string;
    mentor: {
        id: string;
        user: { fullName: string; email?: string };
    };
    _count: { attendees: number };
    attendees?: MentorEventAttendee[];
}

export interface MentorEventAttendee {
    id: string;
    eventId: string;
    umkmProfileId: string;
    status: 'registered' | 'confirmed' | 'attended' | 'cancelled' | 'no_show';
    notes?: string;
    registeredAt: string;
    confirmedAt?: string;
    attendedAt?: string;
    cancelledAt?: string;
    umkmProfile?: {
        id: string;
        businessName: string;
        ownerName: string;
        city?: string;
    };
    event?: MentorEvent;
}

export interface CreateEventDto {
    title: string;
    description: string;
    thumbnail?: string;
    province: string;
    city: string;
    venue?: string;
    address?: string;
    latitude?: number;
    longitude?: number;
    startDate: string;
    endDate: string;
    maxAttendees?: number;
    registrationEnd?: string;
    type?: 'workshop' | 'gathering' | 'training';
    tags?: string[];
}

export interface UpdateEventDto extends Partial<CreateEventDto> {
    status?: 'draft' | 'published' | 'cancelled' | 'completed';
}

export interface EventQueryParams {
    mentorId?: string;
    province?: string;
    city?: string;
    status?: string;
    type?: string;
    upcoming?: boolean;
    skip?: number;
    limit?: number;
}

export interface UMKMByMentorData {
    id: string;
    businessName: string;
    ownerName: string;
    province?: string;
    city?: string;
    segmentation?: string;
    user: { fullName: string; email: string };
    mentoringSessions: {
        date: string;
        topic: string;
        status: string;
    }[];
}

export interface UMKMMapData {
    total: number;
    byRegion: {
        province: string | null;
        city: string | null;
        count: number;
        umkmIds: string[];
    }[];
    markers: {
        id: string;
        name: string;
        lat: number;
        lng: number;
        segmentation?: string;
        city?: string;
    }[];
}

interface ApiResponse<T> {
    success: boolean;
    data: T;
    meta?: {
        total: number;
        skip: number;
        limit: number;
    };
    error?: string;
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function buildQueryString(params?: Record<string, unknown>): string {
    if (!params) return '';
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            searchParams.append(key, String(value));
        }
    });
    const queryString = searchParams.toString();
    return queryString ? `?${queryString}` : '';
}

// ============================================
// API FUNCTIONS
// ============================================

const BASE_URL = '/umkm/mentor-events';

export const mentorEventService = {
    // ========================================
    // PUBLIC ENDPOINTS
    // ========================================

    /**
     * Get list of events with optional filters
     */
    getEvents: async (params?: EventQueryParams) => {
        const url = `${BASE_URL}${buildQueryString(params as unknown as Record<string, unknown>)}`;
        return api.get<ApiResponse<MentorEvent[]>>(url);
    },

    /**
     * Get single event by ID or slug
     */
    getEvent: async (idOrSlug: string) => {
        return api.get<ApiResponse<MentorEvent>>(`${BASE_URL}/${idOrSlug}`);
    },

    // ========================================
    // MENTOR ENDPOINTS
    // ========================================

    /**
     * Create a new event (mentor only)
     */
    createEvent: async (data: CreateEventDto) => {
        return api.post<ApiResponse<MentorEvent>>(BASE_URL, data);
    },

    /**
     * Update an event (mentor only)
     */
    updateEvent: async (id: string, data: UpdateEventDto) => {
        return api.put<ApiResponse<MentorEvent>>(`${BASE_URL}/${id}`, data);
    },

    /**
     * Delete an event (mentor only)
     */
    deleteEvent: async (id: string) => {
        return api.delete<ApiResponse<null>>(`${BASE_URL}/${id}`);
    },

    /**
     * Publish an event (mentor only)
     */
    publishEvent: async (id: string) => {
        return api.put<ApiResponse<MentorEvent>>(`${BASE_URL}/${id}`, { status: 'published' });
    },

    /**
     * Cancel an event (mentor only)
     */
    cancelEvent: async (id: string) => {
        return api.put<ApiResponse<MentorEvent>>(`${BASE_URL}/${id}`, { status: 'cancelled' });
    },

    /**
     * Mark event as completed (mentor only)
     */
    completeEvent: async (id: string) => {
        return api.put<ApiResponse<MentorEvent>>(`${BASE_URL}/${id}`, { status: 'completed' });
    },

    /**
     * Confirm attendee registration (mentor only)
     */
    confirmAttendee: async (eventId: string, umkmProfileId: string) => {
        return api.post<ApiResponse<MentorEventAttendee>>(`${BASE_URL}/${eventId}/confirm`, { umkmProfileId });
    },

    /**
     * Mark attendee as attended (mentor only)
     */
    markAttended: async (eventId: string, umkmProfileId: string) => {
        return api.post<ApiResponse<MentorEventAttendee>>(`${BASE_URL}/${eventId}/mark-attended`, { umkmProfileId });
    },

    /**
     * Get attendees for an event (mentor only)
     */
    getEventAttendees: async (eventId: string, params?: { status?: string; search?: string }) => {
        const url = `${BASE_URL}/${eventId}/attendees${buildQueryString(params)}`;
        return api.get<ApiResponse<MentorEventAttendee[]>>(url);
    },

    /**
     * Update attendee status (mentor only)
     */
    updateAttendance: async (eventId: string, attendeeId: string, status: string) => {
        return api.put<ApiResponse<MentorEventAttendee>>(`${BASE_URL}/${eventId}/attendees/${attendeeId}`, { status });
    },

    /**
     * Get UMKM list by mentor for mapping
     */
    getUMKMByMentor: async (mentorId: string, params?: { province?: string; city?: string }) => {
        const url = `${BASE_URL}/mentors/${mentorId}/umkm${buildQueryString(params)}`;
        return api.get<ApiResponse<UMKMByMentorData[]>>(url);
    },

    /**
     * Get UMKM map data for a mentor
     */
    getUMKMMapData: async (mentorId: string) => {
        return api.get<ApiResponse<UMKMMapData>>(`${BASE_URL}/mentors/${mentorId}/umkm/map`);
    },

    // ========================================
    // UMKM ENDPOINTS
    // ========================================

    /**
     * Get available events for UMKM by location
     */
    getEventsForUMKM: async (params?: { province?: string; city?: string; upcoming?: boolean }) => {
        const url = `${BASE_URL}/umkm/available${buildQueryString(params)}`;
        return api.get<ApiResponse<MentorEvent[]>>(url);
    },

    /**
     * Get my event registrations
     */
    getMyRegistrations: async () => {
        return api.get<ApiResponse<MentorEventAttendee[]>>(`${BASE_URL}/umkm/my-registrations`);
    },

    /**
     * RSVP to an event
     */
    attendEvent: async (eventId: string) => {
        return api.post<ApiResponse<MentorEventAttendee>>(`${BASE_URL}/${eventId}/attend`, {});
    },

    /**
     * Cancel event attendance
     */
    cancelAttendance: async (eventId: string) => {
        return api.delete<ApiResponse<null>>(`${BASE_URL}/${eventId}/attend`);
    },
};

export default mentorEventService;
