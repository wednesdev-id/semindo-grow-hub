// Consultation Types
export interface ConsultantProfile {
    id: string;
    userId: string;
    title?: string;
    tagline?: string;
    bio?: string;
    videoIntroUrl?: string;
    expertiseAreas: string[];
    industries: string[];
    languages: string[];
    yearsExperience?: number;
    hourlyRate?: number;
    currency: string;
    isAcceptingNewClients: boolean;
    status: 'pending' | 'approved' | 'suspended' | 'rejected';
    totalSessions: number;
    averageRating: number;
    responseRate: number;
    user: {
        id: string;
        fullName: string;
        profilePictureUrl?: string;
    };
}

export interface ConsultationRequest {
    id: string;
    clientId: string;
    consultantId: string;
    requestedDate: string;
    requestedStartTime: string;
    requestedEndTime: string;
    durationMinutes: number;
    topic: string;
    description?: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
    isPaid?: boolean;
    quotedPrice?: number;
    meetingUrl?: string;
    meetingPlatform?: string;
    sessionNotes?: string;
    timezone?: string;
    createdAt: string;
    consultant?: ConsultantProfile;
    client?: {
        fullName: string;
        email: string;
    };
}

export interface ChatChannel {
    id: string;
    requestId: string;
    isActive: boolean;
    createdAt: string;
}

export interface ChatMessage {
    id: string;
    channelId: string;
    senderId: string;
    content?: string;
    contentType: 'text' | 'image' | 'file';
    fileUrl?: string;
    isRead: boolean;
    createdAt: string;
    sender: {
        id: string;
        fullName: string;
        profilePictureUrl?: string;
        role?: string;
    };
}

export interface AvailabilitySlot {
    id: string;
    dayOfWeek?: number;
    startTime: string;
    endTime: string;
    isRecurring: boolean;
    specificDate?: string;
    isAvailable: boolean;
}

export interface BookingSlot {
    date: string;
    startTime: string;
    endTime: string;
    status: string;
}

export interface SessionFile {
    id: string;
    requestId: string;
    uploadedBy: string; // userId
    fileName: string;
    fileUrl: string;
    fileSize?: number;
    mimeType?: string;
    description?: string;
    createdAt: string;
    uploader?: {
        fullName: string;
    };
}
