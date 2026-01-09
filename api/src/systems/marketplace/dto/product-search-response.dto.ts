export interface ProductSearchResponse {
    products: any[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
    filters: {
        search?: string;
        category?: string;
        minPrice?: number;
        maxPrice?: number;
        stockStatus?: string;
        sortBy?: string;
    };
}
