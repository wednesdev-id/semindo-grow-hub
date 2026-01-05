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
    id: string;
    name: string;
    slug: string;
    seller: string;
    location: string;
    price: string;
    originalPrice?: string;
    rating: number;
    reviews: number;
    image: string;
    images?: string[];
    category: string;
    badges: string[];
    description: string;
    stock: number;
    status?: string; // draft, active, archived, etc.
    isPublished?: boolean; // Whether product is visible in marketplace
    externalLinks?: { shopee?: string; tokopedia?: string };
}

export interface OrderItem {
    id: string;
    product: Product;
    quantity: number;
    price: string;
}

export interface Order {
    id: string;
    totalAmount: string;
    status: string;
    paymentLink?: string;
    paymentStatus: string;
    createdAt: string;
    items: OrderItem[];
}

export const marketplaceService = {
    getCategories: async (): Promise<Category[]> => {
        // Still mock for now as we don't have a category endpoint
        return [
            { id: "Kuliner", name: "Kuliner & F&B", count: 245 },
            { id: "Fashion", name: "Fashion & Tekstil", count: 189 },
            { id: "Kerajinan", name: "Kerajinan Tangan", count: 156 },
            { id: "Teknologi", name: "Teknologi & Digital", count: 98 },
            { id: "Kesehatan", name: "Kesehatan & Kecantikan", count: 134 },
            { id: "Pertanian", name: "Pertanian & Organik", count: 87 },
            { id: "Otomotif", name: "Otomotif & Spare Part", count: 76 },
            { id: "Elektronik", name: "Elektronik & Gadget", count: 112 }
        ];
    },

    getFeaturedProducts: async (): Promise<Product[]> => {
        const response = await api.get<{ data: any[] }>('/marketplace/products');
        return response.data.map((p: any) => ({
            id: p.id,
            name: p.title,
            slug: p.slug,
            seller: p.seller?.businessName || p.seller?.fullName || 'Unknown Seller',
            location: p.seller?.city || 'Indonesia',
            price: `Rp ${Number(p.price).toLocaleString('id-ID')}`,
            rating: 0,
            reviews: 0,
            image: p.images?.[0] || "/api/placeholder/300/200",
            images: p.images || [],
            category: p.category,
            badges: [],
            description: p.description || '',
            stock: p.stock,
            status: p.status,
            externalLinks: p.externalLinks
        }));
    },

    // Admin: Get ALL products from all sellers (including drafts and unpublished)
    getAllProductsForAdmin: async (): Promise<Product[]> => {
        const response = await api.get<{ data: any[] }>('/marketplace/products', {
            params: { includeAll: true } // This will bypass isPublished filter
        });
        return response.data.map((p: any) => ({
            id: p.id,
            name: p.title,
            slug: p.slug,
            seller: p.seller?.businessName || p.seller?.fullName || 'Unknown Seller',
            location: p.seller?.city || 'Indonesia',
            price: `Rp ${Number(p.price).toLocaleString('id-ID')}`,
            rating: 0,
            reviews: 0,
            image: p.images?.[0] || "/api/placeholder/300/200",
            images: p.images || [],
            category: p.category,
            badges: [],
            description: p.description || '',
            stock: p.stock,
            status: p.status,
            externalLinks: p.externalLinks
        }));
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
                images: p.images || [],
                category: p.category,
                badges: [],
                description: p.description || '',
                stock: p.stock,
                status: p.status,
                externalLinks: p.externalLinks
            };
        } catch (error) {
            return undefined;
        }
    },

    uploadImage: async (file: File): Promise<{ url: string; thumbnail: string; metadata: any }> => {
        const formData = new FormData();
        formData.append('image', file);
        return api.post('/marketplace/upload/image', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    uploadMultipleImages: async (files: File[]): Promise<{ images: { url: string; thumbnail: string; metadata: any }[] }> => {
        const formData = new FormData();
        files.forEach(file => formData.append('images', file));
        return api.post('/marketplace/upload/images', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
    },

    uploadFromUrl: async (url: string): Promise<{ url: string; thumbnail: string; metadata: any }> => {
        return api.post('/marketplace/upload/url', { url });
    },

    createProduct: async (data: any) => {
        // Data should already contain image URLs if uploaded separately
        return api.post('/marketplace/products', data);
    },

    createOrder: async (items: { productId: string; quantity: number }[]) => {
        return api.post('/marketplace/orders', { items });
    },

    getMyOrders: async () => {
        const response = await api.get<{ data: any[] }>('/marketplace/orders');
        return response.data;
    },

    getAllOrders: async () => {
        // Admin endpoint - reusing getMyOrders for now or need specific admin endpoint
        // The UI calls getAllOrders. Let's map it to getMyOrders for seller view
        const response = await api.get<{ data: any[] }>('/marketplace/orders');
        return response.data.map((o: any) => ({
            id: o.id,
            customer: o.user?.fullName || 'Unknown',
            date: new Date(o.createdAt).toLocaleDateString(),
            total: `Rp ${Number(o.totalAmount).toLocaleString('id-ID')}`,
            status: o.status,
            items: o.items.length
        }));
    },

    syncStock: async (productId: string) => {
        return api.post(`/marketplace/products/${productId}/sync`, {});
    },

    getMyProducts: async (): Promise<Product[]> => {
        const response = await api.get<{ data: any[] }>('/marketplace/my-products');
        return response.data.map((p: any) => {
            // Determine correct status based on isPublished
            let displayStatus = p.status;

            // If status is missing or inconsistent with isPublished, fix it
            if (p.isPublished && (!p.status || p.status === 'draft')) {
                displayStatus = 'active';
            } else if (!p.isPublished && p.status === 'active') {
                displayStatus = 'draft';
            } else if (!p.status) {
                // Fallback if status is completely missing
                displayStatus = p.isPublished ? 'active' : 'draft';
            }

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
                images: p.images || [],
                category: p.category,
                badges: [],
                description: p.description || '',
                stock: p.stock,
                status: displayStatus,
                isPublished: p.isPublished,
                externalLinks: p.externalLinks
            };
        });
    },

    deleteProduct: async (id: string) => {
        return api.delete(`/marketplace/products/${id}`);
    },

    archiveProduct: async (id: string) => {
        return api.patch(`/marketplace/products/${id}/archive`);
    },

    updateProduct: async (id: string, data: any) => {
        return api.patch(`/marketplace/products/${id}`, data);
    },

    getTopSellers: async (): Promise<Seller[]> => {
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

    getAdminStats: async () => {
        return {
            totalSales: 150000000,
            totalOrders: 450,
            activeProducts: 120,
            pendingVerifications: 8,
            salesTrend: { value: 15, positive: true },
            ordersTrend: { value: 8, positive: true },
            productsTrend: { value: 5, positive: true },
            verificationTrend: { value: 2, positive: false },
        };
    },

    // Cart API
    getCart: async () => {
        const response = await api.get<{ data: any }>('/marketplace/cart');
        return response.data;
    },

    addToCart: async (productId: string, quantity: number, variantId?: string) => {
        const response = await api.post<{ data: any }>('/marketplace/cart/items', { productId, quantity, variantId });
        return response.data;
    },

    updateCartItem: async (itemId: string, quantity: number) => {
        const response = await api.patch<{ data: any }>(`/marketplace/cart/items/${itemId}`, { quantity });
        return response.data;
    },

    removeFromCart: async (itemId: string) => {
        return api.delete(`/marketplace/cart/items/${itemId}`);
    },

    clearCart: async () => {
        return api.delete('/marketplace/cart');
    },

    updateOrderStatus: async (orderId: string, status: string) => {
        const response = await api.patch<{ data: any }>(`/marketplace/orders/${orderId}/status`, { status });
        return response.data;
    },

    async updateShipment(orderId: string, trackingNumber: string, courier: string) {
        const response = await api.patch<{ data: any }>(`/marketplace/orders/${orderId}/shipment`, { trackingNumber, courier });
        return response.data;
    },

    async getSellerAnalytics() {
        const response = await api.get<{ data: any }>('/marketplace/analytics/seller');
        return response.data;
    },

    async getAdminAnalytics() {
        const response = await api.get<{ data: any }>('/marketplace/analytics/admin');
        return response.data;
    },

    async getPendingProducts() {
        const response = await api.get<{ data: any[] }>('/marketplace/products/pending');
        return response.data;
    },

    async verifyProduct(id: string, approved: boolean) {
        const response = await api.post<{ data: any }>(`/marketplace/products/${id}/verify`, { approved });
        return response.data;
    }
};
