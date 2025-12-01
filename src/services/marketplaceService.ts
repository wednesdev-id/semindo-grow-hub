import { api } from './api';

export interface Seller {
    id: string;
    name: string;
    location: string;
    products: number;
    rating: number;
    totalSales: string;
    verified: boolean;
    image: string;
}

export interface Category {
    id: string;
    name: string;
    count: number;
}

export interface Product {
    id: number;
    name: string;
    slug: string;
    seller: string;
    location: string;
    price: string;
    originalPrice?: string;
    rating: number;
    reviews: number;
    image: string;
    category: string;
    badges: string[];
    description: string;
}

// Mock Data
export const marketplaceService = {
    getCategories: async (): Promise<Category[]> => {
        // Currently hardcoded as backend doesn't have category endpoint yet, but that's fine for now
        return [
            { id: "kuliner", name: "Kuliner & F&B", count: 245 },
            { id: "fashion", name: "Fashion & Tekstil", count: 189 },
            { id: "kerajinan", name: "Kerajinan Tangan", count: 156 },
            { id: "teknologi", name: "Teknologi & Digital", count: 98 },
            { id: "kesehatan", name: "Kesehatan & Kecantikan", count: 134 },
            { id: "pertanian", name: "Pertanian & Organik", count: 87 },
            { id: "otomotif", name: "Otomotif & Spare Part", count: 76 },
            { id: "elektronik", name: "Elektronik & Gadget", count: 112 }
        ];
    },

    getFeaturedProducts: async (): Promise<Product[]> => {
        const response = await api.get<{ data: any[] }>('/marketplace/products');
        // Map backend response to frontend Product interface
        return response.data.map((p: any) => ({
            id: p.id,
            name: p.title,
            slug: p.slug,
            seller: p.seller?.businessName || p.seller?.fullName || 'Unknown Seller',
            location: p.seller?.city || 'Indonesia', // Assuming location is in seller profile
            price: `Rp ${Number(p.price).toLocaleString('id-ID')}`,
            rating: 0, // Not yet implemented
            reviews: 0, // Not yet implemented
            image: p.images?.[0] || "/api/placeholder/300/200",
            category: p.category,
            badges: [],
            description: p.description || ''
        }));
    },

    getTopSellers: async (): Promise<Seller[]> => {
        // Mock for now as backend doesn't have top sellers endpoint
        return [
            {
                id: "1",
                name: "CV Kopi Nusantara",
                location: "Aceh",
                products: 24,
                rating: 4.8,
                totalSales: "2.5K+",
                verified: true,
                image: "/api/placeholder/80/80"
            },
            {
                id: "2",
                name: "Batik Heritage Solo",
                location: "Solo",
                products: 156,
                rating: 4.9,
                totalSales: "1.8K+",
                verified: true,
                image: "/api/placeholder/80/80"
            },
            {
                id: "3",
                name: "TechSolution Indonesia",
                location: "Jakarta",
                products: 12,
                rating: 4.7,
                totalSales: "3.2K+",
                verified: true,
                image: "/api/placeholder/80/80"
            }
        ];
    },

    getProductBySlug: async (slug: string): Promise<Product | undefined> => {
        try {
            const response = await api.get<{ data: any }>(`/marketplace/products/${slug}`);
            const p = response.data;
            return {
                id: p.id,
                name: p.title,
                slug: p.slug,
                seller: p.seller?.businessName || p.seller?.fullName || 'Unknown Seller',
                location: p.seller?.city || 'Indonesia',
                price: `Rp ${Number(p.price).toLocaleString('id-ID')}`,
                rating: 0,
                reviews: 0,
                image: p.images?.[0] || "/api/placeholder/300/200",
                category: p.category,
                badges: [],
                description: p.description || ''
            };
        } catch (error) {
            return undefined;
        }
    },

    // Admin Methods
    getAdminStats: async () => {
        // Mock implementation
        return {
            totalSales: 150000000,
            totalOrders: 450,
            activeProducts: 120,
            pendingVerifications: 8,
            salesTrend: { value: 15, positive: true },
            ordersTrend: { value: 8, positive: true },
            productsTrend: { value: 5, positive: true },
            verificationTrend: { value: 2, positive: false }, // Decreased pending is good? Or increased load? Let's say trend is count change.
        };
        // const response = await api.get<{ data: any }>('/marketplace/admin/stats');
        // return response.data;
    },

    getAllOrders: async () => {
        // Mock implementation
        return [
            {
                id: "ORD-001",
                customer: "Budi Santoso",
                date: "2024-03-15",
                total: "Rp 450.000",
                status: "completed",
                items: 3,
            },
            {
                id: "ORD-002",
                customer: "Siti Aminah",
                date: "2024-03-14",
                total: "Rp 1.250.000",
                status: "processing",
                items: 1,
            },
            {
                id: "ORD-003",
                customer: "Rudi Hartono",
                date: "2024-03-14",
                total: "Rp 75.000",
                status: "cancelled",
                items: 2,
            },
        ];
        // const response = await api.get<{ data: any[] }>('/marketplace/admin/orders');
        // return response.data;
    },

    getPendingProducts: async () => {
        // Mock implementation
        return [
            {
                id: 1,
                name: "Kopi Gayo Premium",
                seller: "CV Kopi Nusantara",
                category: "Kuliner",
                price: "Rp 85.000",
                submittedAt: "2024-03-15",
                status: "pending",
            },
            {
                id: 2,
                name: "Batik Tulis Solo",
                seller: "Batik Heritage",
                category: "Fashion",
                price: "Rp 450.000",
                submittedAt: "2024-03-14",
                status: "pending",
            },
        ];
        // const response = await api.get<{ data: any[] }>('/marketplace/admin/products/pending');
        // return response.data;
    },

    verifyProduct: async (productId: number, approved: boolean) => {
        // Mock implementation
        return { success: true };
        // const response = await api.post(`/marketplace/admin/products/${productId}/verify`, { approved });
        // return response.data;
    }
};
