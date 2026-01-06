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


export interface StoreDetails {
    id: string;
    name: string;
    slug: string;
    description: string;
    logoUrl?: string;
    bannerUrl?: string;
    rating: number;
    totalSales: number;
    user?: {
        fullName: string;
        businessName: string;
        profilePictureUrl?: string;
    };
    products: Product[];
}

export interface ProductImage {
    url: string;
    thumbnail: string;
    isMain?: boolean;
    metadata?: {
        width: number;
        height: number;
        size: number;
        format: string;
        originalName?: string;
    };
}

export interface Product {
    id: string;
    name: string;
    slug: string;
    seller: string;
    location: string;
    price: string | number;
    originalPrice?: string;
    rating: number;
    reviews: number;
    image: string;
    images: ProductImage[];
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
        const response = await api.get<{ data: Category[] }>('/marketplace/products/categories');
        return response.data;
    },

    getFeaturedProducts: async (): Promise<Product[]> => {
        const response = await api.get<{ data: any[] }>('/marketplace/products');
        return response.data.map((p: any) => {
            const firstImage = p.images?.[0];
            const imageUrl = typeof firstImage === 'string'
                ? firstImage
                : (firstImage?.thumbnail || firstImage?.url || "/api/placeholder/300/200");

            return {
                id: p.id,
                name: p.title,
                slug: p.slug,
                seller: p.seller?.businessName || p.seller?.fullName || 'Unknown Seller',
                location: p.seller?.umkmProfile?.city || 'Indonesia',
                price: `Rp ${Number(p.price).toLocaleString('id-ID')}`,
                rating: 0,
                reviews: 0,
                image: imageUrl,
                images: Array.isArray(p.images) ? p.images : [],
                category: p.category,
                badges: [],
                description: p.description || '',
                stock: p.stock,
                status: p.status,
                externalLinks: p.externalLinks
            };
        });
    },

    // Admin: Get ALL products from all sellers (including drafts and unpublished)
    getAllProductsForAdmin: async (): Promise<Product[]> => {
        const response = await api.get<{ data: any[] }>('/marketplace/products?includeAll=true');
        return response.data.map((p: any) => {
            const firstImage = p.images?.[0];
            const imageUrl = typeof firstImage === 'string'
                ? firstImage
                : (firstImage?.thumbnail || firstImage?.url || "/api/placeholder/300/200");

            return {
                id: p.id,
                name: p.title,
                slug: p.slug,
                seller: p.seller?.businessName || p.seller?.fullName || 'Unknown Seller',
                location: p.seller?.umkmProfile?.city || 'Indonesia',
                price: `Rp ${Number(p.price).toLocaleString('id-ID')}`,
                rating: 0,
                reviews: 0,
                image: imageUrl,
                images: Array.isArray(p.images) ? p.images : [],
                category: p.category,
                badges: [],
                description: p.description || '',
                stock: p.stock,
                status: p.status,
                externalLinks: p.externalLinks
            };
        });
    },

    // Search and filter products
    searchProducts: async (params: {
        search?: string;
        category?: string;
        minPrice?: number;
        maxPrice?: number;
        stockStatus?: string;
        sortBy?: string;
        page?: number;
        limit?: number;
    }): Promise<{
        products: Product[];
        pagination: {
            total: number;
            page: number;
            limit: number;
            totalPages: number;
        };
    }> => {
        const queryParams = new URLSearchParams();

        if (params.search) queryParams.append('search', params.search);
        if (params.category) queryParams.append('category', params.category);
        if (params.minPrice) queryParams.append('minPrice', params.minPrice.toString());
        if (params.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
        if (params.stockStatus) queryParams.append('stockStatus', params.stockStatus);
        if (params.sortBy) queryParams.append('sortBy', params.sortBy);
        if (params.page) queryParams.append('page', params.page.toString());
        if (params.limit) queryParams.append('limit', params.limit.toString());

        const response = await api.get<{
            products: any[];
            pagination: {
                total: number;
                page: number;
                limit: number;
                totalPages: number;
            };
        }>(`/marketplace/search?${queryParams.toString()}`);

        const products = response.products.map((p: any) => {
            const firstImage = p.images?.[0];
            const imageUrl = typeof firstImage === 'string'
                ? firstImage
                : (firstImage?.thumbnail || firstImage?.url || "/api/placeholder/300/200");

            return {
                id: p.id,
                name: p.title,
                slug: p.slug,
                seller: p.store?.name || 'Unknown Seller',
                location: 'Indonesia',
                price: `Rp ${Number(p.price).toLocaleString('id-ID')}`,
                rating: p.store?.rating || 0,
                reviews: 0,
                image: imageUrl,
                images: Array.isArray(p.images) ? p.images : [],
                category: p.category,
                badges: [],
                description: p.description || '',
                stock: p.stock,
                status: p.status,
                externalLinks: p.externalLinks
            };
        });

        return {
            products,
            pagination: response.pagination
        };
    },

    getProductBySlug: async (slug: string): Promise<Product | undefined> => {
        try {
            const response = await api.get<{ data: any }>(`/marketplace/products/${slug}`);
            const p = response.data;
            const firstImage = p.images?.[0];
            const imageUrl = typeof firstImage === 'string'
                ? firstImage
                : (firstImage?.thumbnail || firstImage?.url || "/api/placeholder/300/200");

            return {
                id: p.id,
                name: p.title,
                slug: p.slug,
                seller: p.seller?.businessName || p.seller?.fullName || 'Unknown Seller',
                location: p.seller?.umkmProfile?.city || 'Indonesia',
                price: `Rp ${Number(p.price).toLocaleString('id-ID')}`,
                rating: 0,
                reviews: 0,
                image: imageUrl,
                images: Array.isArray(p.images) ? p.images : [],
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

    uploadMultipleImages: async (files: File[]): Promise<ProductImage[]> => {
        const formData = new FormData();
        files.forEach(file => formData.append('images', file));
        try {
            const response = await api.post<{ data: ProductImage[] } | any>('/marketplace/upload/images', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            console.log('[MarketplaceService] Raw upload response:', response);

            // Handle berbagai struktur respon secara defensif
            if (response && response.data && Array.isArray(response.data)) {
                return response.data;
            } else if (response && response.data && response.data.data && Array.isArray(response.data.data)) {
                return response.data.data;
            } else if (response && Array.isArray(response)) {
                return response;
            } else if (response && response.results && Array.isArray(response.results)) {
                return response.results;
            }

            // Log detail jika masih gagal
            console.error('Unexpected upload response structure:', JSON.stringify(response));
            return [];
        } catch (error) {
            console.error('Upload request failed:', error);
            throw error;
        }
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

    getMyProducts: async (filters?: {
        search?: string;
        category?: string;
        stockStatus?: string;
        sortBy?: string;
        minPrice?: number;
        maxPrice?: number;
    }): Promise<Product[]> => {
        const queryParams = new URLSearchParams();
        if (filters?.search) queryParams.append('search', filters.search);
        if (filters?.category) queryParams.append('category', filters.category);
        if (filters?.stockStatus) queryParams.append('stockStatus', filters.stockStatus);
        if (filters?.sortBy) queryParams.append('sortBy', filters.sortBy);
        if (filters?.minPrice) queryParams.append('minPrice', filters.minPrice.toString());
        if (filters?.maxPrice) queryParams.append('maxPrice', filters.maxPrice.toString());

        const response = await api.get<{ data: any[] }>(`/marketplace/my-products?${queryParams.toString()}`);
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

            const firstImage = p.images?.[0];
            const imageUrl = typeof firstImage === 'string'
                ? firstImage
                : (firstImage?.thumbnail || firstImage?.url || "/api/placeholder/300/200");

            return {
                id: p.id,
                name: p.title,
                slug: p.slug,
                seller: p.seller?.businessName || p.seller?.fullName || 'Unknown Seller',
                location: p.seller?.umkmProfile?.city || 'Indonesia',
                price: `Rp ${Number(p.price).toLocaleString('id-ID')}`,
                rating: 0,
                reviews: 0,
                image: imageUrl,
                images: Array.isArray(p.images) ? p.images : [],
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
        return api.patch(`/marketplace/products/${id}/archive`, {});
    },

    updateProduct: async (id: string, data: any) => {
        return api.patch(`/marketplace/products/${id}`, data);
    },

    getTopSellers: async (): Promise<Seller[]> => {
        const response = await api.get<{ data: Seller[] }>('/marketplace/products/top-sellers');
        return response.data;
    },

    getAdminStats: async () => {
        const response = await api.get<{ data: any }>('/marketplace/analytics/admin');
        const data = response.data;
        return {
            totalSales: data.totalSales || 0,
            totalOrders: data.totalOrders || 0,
            activeProducts: data.activeProducts || 0,
            pendingVerifications: data.pendingProducts || 0,
            salesTrend: { value: 0, positive: true },
            ordersTrend: { value: 0, positive: true },
            productsTrend: { value: 0, positive: true },
            verificationTrend: { value: 0, positive: false },
        };
    },

    // Cart API
    getCart: async () => {
        const response = await api.get<{ data: any }>('/marketplace/cart');
        return response.data;
    },

    addToCart: async (productId: string, quantity: number) => {
        const response = await api.post<{ data: any }>('/marketplace/cart/items', { productId, quantity });
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
    },

};
