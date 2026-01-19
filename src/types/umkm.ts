export interface Document {
    id: string;
    type: string;
    fileName: string;
    fileUrl: string;
    status: 'pending' | 'verified' | 'rejected';
    createdAt: string;
    verifiedAt?: string;
    rejectionReason?: string;
}

export interface MentoringSession {
    id: string;
    date: string;
    topic: string;
    notes: string;
    status: string;
    mentor: {
        user: {
            fullName: string;
        };
    };
}

export interface UMKMProfile {
    id: string;
    userId: string;
    businessName: string;
    ownerName: string;
    nib?: string;
    npwp?: string;
    address?: string;
    businessAddress?: string;
    province?: string;
    city?: string;
    district?: string;
    village?: string;
    postalCode?: string;
    location?: any;
    phone?: string;
    email?: string;
    website?: string;
    sector?: string;
    turnover?: number;
    assets?: number;
    employees?: number;
    foundedYear?: number;
    productionCapacity?: string;
    salesChannels?: string[];
    socialMedia?: any;
    omzetMonthly?: number;
    legalStatus?: any;
    level?: string;
    segmentation?: string;
    segmentationReason?: string;
    status: string;
    selfAssessmentScore?: number;
    readinessIndex?: any;
    createdAt: string;
    updatedAt: string;
    user: {
        email: string;
        phone: string;
    };
    documents?: Document[];
    mentoringSessions?: MentoringSession[];
}

export interface UMKMListResponse {
    data: UMKMProfile[];
    meta: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}
