import { api } from './api';

export interface FinancingPartner {
    id: string;
    name: string;
    slug: string;
    provider: string;
    type: string;
    maxAmount: string; // Decimal comes as string
    interestRate: string;
    term: string;
    requirements: string[];
    features: string[];
    description: string;
    logoUrl?: string;
    isActive: boolean;
}

export interface LoanApplication {
    id: string;
    status: string;
    amount: number;
    term: number;
    purpose: string;
    createdAt: string;
    partner: FinancingPartner;
}

export const financingService = {
    getPartners: async (): Promise<FinancingPartner[]> => {
        const response = await api.get('/financing/partners');
        return response.data.data;
    },

    createApplication: async (data: {
        partnerId: string;
        amount: number;
        term: number;
        purpose: string;
        notes?: string;
    }): Promise<LoanApplication> => {
        const response = await api.post('/financing/apply', data);
        return response.data.data;
    },

    getMyApplications: async (): Promise<LoanApplication[]> => {
        const response = await api.get('/financing/applications');
        return response.data.data;
    },
};
