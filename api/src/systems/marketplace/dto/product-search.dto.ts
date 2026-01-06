/**
 * Product Search DTO
 * Query parameters for searching and filtering products
 */
export interface ProductSearchDto {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    stockStatus?: 'all' | 'in_stock' | 'low_stock' | 'out_of_stock';
    sortBy?: 'newest' | 'price_asc' | 'price_desc' | 'popular';
    page?: number;
    limit?: number;
    sellerId?: string;
    status?: string;
}

/**
 * Default values for search parameters
 */
export const DEFAULT_SEARCH_PARAMS: Partial<ProductSearchDto> = {
    stockStatus: 'all',
    sortBy: 'newest',
    page: 1,
    limit: 20,
};
