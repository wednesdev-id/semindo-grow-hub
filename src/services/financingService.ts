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
        const response = await api.get<{ data: FinancingPartner[] }>('/financing/partners');
        return response.data;
    },

    createApplication: async (data: {
        partnerId: string;
        amount: number;
        term: number;
        purpose: string;
        notes?: string;
    }): Promise<LoanApplication> => {
        const response = await api.post<{ data: LoanApplication }>('/financing/apply', data);
        return response.data;
    },

    getMyApplications: async (): Promise<LoanApplication[]> => {
        const response = await api.get<{ data: LoanApplication[] }>('/financing/applications');
        return response.data;
    },

    // Admin Methods
    getAllApplications: async (): Promise<LoanApplication[]> => {
        // Mock implementation
        return [
            {
                id: "APP-001",
                status: "pending",
                amount: 50000000,
                term: 12,
                purpose: "Modal Usaha",
                createdAt: "2024-03-15",
                partner: {
                    id: "1",
                    name: "Bank BRI",
                    slug: "bank-bri",
                    provider: "Bank BRI",
                    type: "Bank",
                    maxAmount: "500000000",
                    interestRate: "6%",
                    term: "36",
                    requirements: [],
                    features: [],
                    description: "",
                    isActive: true,
                },
            },
            {
                id: "APP-002",
                status: "approved",
                amount: 25000000,
                term: 6,
                purpose: "Pembelian Alat",
                createdAt: "2024-03-14",
                partner: {
                    id: "2",
                    name: "Bank Mandiri",
                    slug: "bank-mandiri",
                    provider: "Bank Mandiri",
                    type: "Bank",
                    maxAmount: "200000000",
                    interestRate: "6.5%",
                    term: "24",
                    requirements: [],
                    features: [],
                    description: "",
                    isActive: true,
                },
            },
        ];
        // const response = await api.get<{ data: LoanApplication[] }>('/financing/admin/applications');
        // return response.data;
    },

    createPartner: async (data: Partial<FinancingPartner>) => {
        const response = await api.post<{ data: FinancingPartner }>('/financing/partners', data);
        return response.data;
    },

    updatePartner: async (id: string, data: Partial<FinancingPartner>) => {
        const response = await api.patch<{ data: FinancingPartner }>(`/financing/partners/${id}`, data);
        return response.data;
    },

    deletePartner: async (id: string) => {
        await api.delete(`/financing/partners/${id}`);
    },
};
