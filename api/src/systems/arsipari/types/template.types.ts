// Letter Template Types

export interface CreateLetterTemplateDto {
  name: string;
  code: string;
  type: string;
  description?: string;
  letterheadId?: string;
  content: string;
  variables: string[];
  numberFormat?: string;
}

export interface UpdateLetterTemplateDto {
  name?: string;
  code?: string;
  type?: string;
  description?: string;
  letterheadId?: string;
  content?: string;
  variables?: string[];
  numberFormat?: string;
  isActive?: boolean;
}

export interface LetterTemplateFilters {
  type?: string;
  letterheadId?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface RenderTemplateDto {
  templateId: string;
  data: Record<string, any>;
}

export interface LetterheadFilters {
  isActive?: boolean;
  isDefault?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateLetterheadDto {
  name: string;
  unit?: string;
  address?: string;
  website?: string;
  email?: string;
  phone?: string;
  logoUrl?: string;
  config?: Record<string, any>;
  isDefault?: boolean;
}

export interface UpdateLetterheadDto {
  name?: string;
  unit?: string;
  address?: string;
  website?: string;
  email?: string;
  phone?: string;
  logoUrl?: string;
  config?: Record<string, any>;
  isActive?: boolean;
  isDefault?: boolean;
}
