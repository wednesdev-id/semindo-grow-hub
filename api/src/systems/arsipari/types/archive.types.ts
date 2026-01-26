// Archive Types

export interface CreateArchiveDto {
  incomingLetterId?: string;
  outgoingLetterId?: string;
  categoryId?: string;
  archiveYear: number;
  archiveMonth: number;
  location?: string;
  protectionLevel?: string;
  activeRetention?: number;
  inactiveRetention?: number;
  notes?: string;
}

export interface UpdateArchiveDto {
  location?: string;
  protectionLevel?: string;
  activeRetention?: number;
  inactiveRetention?: number;
  status?: string;
  notes?: string;
}

export interface ArchiveFilters {
  letterType?: string;
  categoryId?: string;
  archiveYear?: number;
  archiveMonth?: number;
  status?: string;
  protectionLevel?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface LetterCategoryFilters {
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateLetterCategoryDto {
  code: string;
  name: string;
  description?: string;
}

export interface UpdateLetterCategoryDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}
