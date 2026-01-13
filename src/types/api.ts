export interface ApiResponse<T> {
    data: T;
    message?: string;
    error?: string;
}

export interface PaginatedMeta {
    page: number;
    limit: number;
    total: number;
    lastPage: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: PaginatedMeta;
    message?: string;
}
