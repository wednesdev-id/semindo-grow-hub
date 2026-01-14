// Consultation Types
export interface ExpertiseCategory {
    id: string;
    name: string;
    slug: string;
    description?: string;
    icon: string;
    categoryGroup?: string;
}

export interface ConsultationPackage {
    id: string;
    consultantId: string;
    name: string;
    durationMinutes: number;
    price: number;
    description?: string;
    isActive: boolean;
    sortOrder: number;
}

export interface ConsultantProfile {
    id: string;
    userId: string;
    title?: string;
    tagline?: string;
    bio?: string;
    videoIntroUrl?: string;
    expertiseAreas: string[];
    expertise?: { expertise: ExpertiseCategory }[]; // New: from junction table
    industries: string[];
    languages: string[];
    yearsExperience?: number;
    certifications?: string;
    education?: string;
    hourlyRate?: number;
    currency: string;
    isAcceptingNewClients: boolean;
    status: 'pending' | 'approved' | 'suspended' | 'rejected';
    totalSessions: number;
    averageRating: number;
    responseRate: number;
    packages?: ConsultationPackage[];
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
    packageId?: string;
    requestedDate: string;
    requestedStartTime: string;
    requestedEndTime: string;
    durationMinutes: number;
    topic: string;
    description?: string;
    status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'completed';
    statusReason?: string;
    isPaid?: boolean;
    quotedPrice?: number;
    meetingUrl?: string;
    meetingPlatform?: string;
    sessionNotes?: string;
    timezone?: string;
    isArchived?: boolean;
    archivedAt?: string;
    createdAt: string;
    consultant?: ConsultantProfile;
    client?: {
        fullName: string;
        email: string;
        phone?: string;
        profilePictureUrl?: string;
    };
    type?: {
        name: string;
        slug?: string;
    };
    unreadCount?: number;
}

export interface ChatChannel {
    id: string;
    requestId: string;
    isActive: boolean;
    createdAt: string;
    messages?: ChatMessage[];
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

export interface ConsultationReview {
    id: string;
    consultantId: string;
    clientId: string;
    rating: number;
    comment?: string;
    isPublished: boolean;
    createdAt: string;
    client?: {
        fullName: string;
        profilePictureUrl?: string;
    };
}

export interface ConsultationMinutes {
    id: string;
    requestId: string;
    audioFileUrl?: string;
    audioFileName?: string;
    audioFileSize?: number;
    audioDuration?: number;
    transcript?: string;
    summary?: string;
    keyPoints?: string[];
    actionItems?: Array<{
        task: string;
        priority: 'high' | 'medium' | 'low';
    }>;
    recommendations?: string;
    status: 'draft' | 'queued' | 'processing' | 'ready' | 'published';
    processingError?: string;
    createdBy: string;
    publishedAt?: string;
    createdAt: string;
    updatedAt: string;
}
