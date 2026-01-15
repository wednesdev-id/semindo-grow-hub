import { api } from '@/services/api';

export interface LocationData {
    address: string;
    city: string;
    province: string;
    lat: number;
    lng: number;
}

export interface OnboardingData {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    businessName: string;
    sector: string;
    omzetMonthly: string;
    challenges: string;
    requestedServices: string[];
    ownerLocation: LocationData;
    businessLocation: LocationData;
}

export interface OnboardingResponse {
    success: boolean;
    message: string;
    data?: {
        userId: string;
        umkmProfileId: string;
        email: string;
        businessName: string;
        whatsappLink: string;
    };
}

export interface ServiceOption {
    id: string;
    name: string;
    icon: string;
    description: string;
}

export const onboardingService = {
    /**
     * Register new UMKM
     */
    register: async (data: OnboardingData): Promise<OnboardingResponse> => {
        return api.post<OnboardingResponse>('/onboarding/register', data);
    },

    /**
     * Get available services list
     */
    getServices: async (): Promise<ServiceOption[]> => {
        const response = await api.get<{ success: boolean; data: ServiceOption[] }>('/onboarding/services');
        return response.data;
    },

    /**
     * Get business sectors list
     */
    getSectors: async (): Promise<string[]> => {
        const response = await api.get<{ success: boolean; data: string[] }>('/onboarding/sectors');
        return response.data;
    },

    /**
     * Get omzet ranges list
     */
    getOmzetRanges: async (): Promise<string[]> => {
        const response = await api.get<{ success: boolean; data: string[] }>('/onboarding/omzet-ranges');
        return response.data;
    },
};
