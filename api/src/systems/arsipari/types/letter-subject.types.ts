export interface CreateLetterSubjectDto {
    code: string;
    name: string;
    description?: string;
}

export interface UpdateLetterSubjectDto {
    code?: string;
    name?: string;
    description?: string;
    isActive?: boolean;
}

export interface LetterSubjectFilters {
    isActive?: boolean;
    search?: string;
    page?: number;
    limit?: number;
}
