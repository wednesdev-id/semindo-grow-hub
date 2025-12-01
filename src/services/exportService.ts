import { api } from './api';

export interface ExportHSCode {
    id: string;
    code: string;
    description: string;
    tariff: string;
    requirements: string[];
    category: string;
}

export interface ExportCountry {
    id: string;
    name: string;
    code: string;
    flag: string;
    market: string;
    distance: string;
    shippingTime: string;
    avgTariff: string;
    requirements: string[];
    topProducts: string[];
}

export interface ExportBuyer {
    id: string;
    companyName: string;
    countryId: string;
    countryName: string; // Helper for UI
    category: string;
    products: string[];
    volume: string;
    isVerified: boolean;
    rating: number;
    established: string; // Added for UI
}


export const exportService = {
    getHSCodes: async (query?: string): Promise<ExportHSCode[]> => {
        const queryString = query ? `?q=${encodeURIComponent(query)}` : '';
        const response = await api.get<{ status: string; data: ExportHSCode[] }>(`/export/hscodes${queryString}`);
        return response.data;
    },

    getCountries: async (): Promise<ExportCountry[]> => {
        const response = await api.get<{ status: string; data: ExportCountry[] }>('/export/countries');
        return response.data;
    },

    getBuyers: async (filters?: { countryId?: string; category?: string }): Promise<ExportBuyer[]> => {
        const params = new URLSearchParams();
        if (filters?.countryId && filters.countryId !== "all") params.append('countryId', filters.countryId);
        if (filters?.category && filters.category !== "all") params.append('category', filters.category);

        const queryString = params.toString() ? `?${params.toString()}` : '';
        const response = await api.get<{ status: string; data: ExportBuyer[] }>(`/export/buyers${queryString}`);
        return response.data;
    },

    getLogisticsCost: async (origin: string, destinationCountry: string, weight: number, volume: number) => {
        await new Promise(resolve => setTimeout(resolve, 800));

        // Simple mock calculation (Client-side for now)
        // We need to fetch the country to get distance/shipping time if we want to be accurate,
        // but for now we'll just use the destination string or fetch all countries to find it.
        // To keep it simple and fast without extra API calls, we might need to rely on the country list already fetched in the component.
        // However, this service method is standalone. 
        // Let's fetch the country details first.

        try {
            const countriesResponse = await api.get<{ data: ExportCountry[] }>('/export/countries');
            const countries = countriesResponse.data.data;
            const country = countries.find(c => c.name === destinationCountry || c.code === destinationCountry);

            if (!country) throw new Error("Country not found");

            const baseRateSea = 1.5; // per kg
            const baseRateAir = 8.0; // per kg

            // Distance factor (very rough parsing)
            const distance = parseInt(country.distance.replace(/,/g, '').split(' ')[0]);
            const distanceFactor = distance / 1000;

            return {
                seaFreight: Math.round(weight * baseRateSea * distanceFactor) + 100,
                airFreight: Math.round(weight * baseRateAir * distanceFactor) + 200,
                currency: "USD",
                estimatedDaysSea: country.shippingTime.split(' ')[0] + " (Sea)",
                estimatedDaysAir: "3-5 (Air)"
            };
        } catch (e) {
            console.error("Error calculating logistics:", e);
            // Fallback if API fails or country not found
            return {
                seaFreight: 0,
                airFreight: 0,
                currency: "USD",
                estimatedDaysSea: "N/A",
                estimatedDaysAir: "N/A"
            };
        }
    }
};

