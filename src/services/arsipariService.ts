/**
 * Arsipari Service
 * Frontend service for Arsipari (Mail & Archive Management) API calls
 */

import { api } from './api';
import type {
  IncomingLetter,
  OutgoingLetter,
  Disposition,
  LetterTemplate,
  Letterhead,
  LetterCategory,
  LetterSubject,
  Archive,
  IncomingLetterFilters,
  OutgoingLetterFilters,
  DispositionFilters,
  ArchiveFilters,
  CreateIncomingLetterDto,
  UpdateIncomingLetterDto,
  CreateOutgoingLetterDto,
  UpdateOutgoingLetterDto,
  CreateDispositionDto,
  LetterStatistics,
  ApiResponse,
  PaginatedResponse,
} from '@/types/arsipari';

const BASE_URL = '/arsip';

// ============================================
// INCOMING LETTER / SURAT MASUK
// ============================================

export const suratMasukService = {
  /**
   * List incoming letters with filters
   */
  async list(filters?: IncomingLetterFilters): Promise<PaginatedResponse<IncomingLetter>> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.categoryId) params.append('categoryId', filters.categoryId);
    if (filters?.priority) params.append('priority', filters.priority);
    if (filters?.classification) params.append('classification', filters.classification);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    params.append('page', String(filters?.page || 1));
    params.append('limit', String(filters?.limit || 20));

    const url = `${BASE_URL}/surat-masuk${params.toString() ? `?${params}` : ''}`;
    return api.get<PaginatedResponse<IncomingLetter>>(url);
  },

  /**
   * Get incoming letter by ID
   */
  async getById(id: string): Promise<ApiResponse<IncomingLetter>> {
    return api.get<ApiResponse<IncomingLetter>>(`${BASE_URL}/surat-masuk/${id}`);
  },

  /**
   * Create incoming letter
   */
  async create(data: CreateIncomingLetterDto & { file?: File }): Promise<ApiResponse<IncomingLetter>> {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      const value = (data as any)[key];
      if (key === 'file' && value instanceof File) {
        formData.append('file', value);
      } else if (value !== undefined && value !== null) {
        if (value instanceof Date) {
          formData.append(key, value.toISOString());
        } else {
          formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        }
      }
    });

    return api.post<ApiResponse<IncomingLetter>>(`${BASE_URL}/surat-masuk`, formData);
  },

  /**
   * Update incoming letter
   */
  async update(id: string, data: UpdateIncomingLetterDto & { file?: File }): Promise<ApiResponse<IncomingLetter>> {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      const value = (data as any)[key];
      if (key === 'file' && value instanceof File) {
        formData.append('file', value);
      } else if (value !== undefined && value !== null) {
        if (value instanceof Date) {
          formData.append(key, value.toISOString());
        } else {
          formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        }
      }
    });

    return api.patch<ApiResponse<IncomingLetter>>(`${BASE_URL}/surat-masuk/${id}`, formData);
  },

  /**
   * Update incoming letter status
   */
  async updateStatus(id: string, status: string, notes?: string): Promise<ApiResponse<IncomingLetter>> {
    return api.patch<ApiResponse<IncomingLetter>>(`${BASE_URL}/surat-masuk/${id}/status`, {
      status,
      notes,
    });
  },

  /**
   * Delete incoming letter
   */
  async delete(id: string): Promise<ApiResponse<{ message: string }>> {
    return api.delete<ApiResponse<{ message: string }>>(`${BASE_URL}/surat-masuk/${id}`);
  },

  /**
   * Get statistics
   */
  async getStatistics(): Promise<ApiResponse<LetterStatistics['incomingLetters']>> {
    return api.get<ApiResponse<LetterStatistics['incomingLetters']>>(`${BASE_URL}/surat-masuk/statistics`);
  },
};

// ============================================
// OUTGOING LETTER / SURAT KELUAR
// ============================================

export const suratKeluarService = {
  /**
   * List outgoing letters with filters
   */
  async list(filters?: OutgoingLetterFilters): Promise<PaginatedResponse<OutgoingLetter>> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.categoryId) params.append('categoryId', filters.categoryId);
    if (filters?.templateId) params.append('templateId', filters.templateId);
    if (filters?.search) params.append('search', filters.search);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    params.append('page', String(filters?.page || 1));
    params.append('limit', String(filters?.limit || 20));

    const url = `${BASE_URL}/surat-keluar${params.toString() ? `?${params}` : ''}`;
    return api.get<PaginatedResponse<OutgoingLetter>>(url);
  },

  /**
   * Get outgoing letter by ID
   */
  async getById(id: string): Promise<ApiResponse<OutgoingLetter>> {
    return api.get<ApiResponse<OutgoingLetter>>(`${BASE_URL}/surat-keluar/${id}`);
  },

  /**
   * Create outgoing letter (draft)
   */
  async create(data: CreateOutgoingLetterDto): Promise<ApiResponse<OutgoingLetter>> {
    return api.post<ApiResponse<OutgoingLetter>>(`${BASE_URL}/surat-keluar`, data);
  },

  /**
   * Update outgoing letter
   */
  async update(id: string, data: UpdateOutgoingLetterDto): Promise<ApiResponse<OutgoingLetter>> {
    return api.patch<ApiResponse<OutgoingLetter>>(`${BASE_URL}/surat-keluar/${id}`, data);
  },

  /**
   * Submit for approval
   */
  async submitApproval(id: string, approvalUserIds: string[], notes?: string): Promise<ApiResponse<OutgoingLetter>> {
    return api.post<ApiResponse<OutgoingLetter>>(`${BASE_URL}/surat-keluar/${id}/submit`, {
      approvalUserIds,
      notes,
    });
  },

  /**
   * Process approval (approve/reject)
   */
  async processApproval(
    letterId: string,
    approvalId: string,
    status: 'APPROVED' | 'REJECTED',
    notes?: string
  ): Promise<ApiResponse<any>> {
    return api.post<ApiResponse<any>>(`${BASE_URL}/surat-keluar/${letterId}/approvals/${approvalId}`, {
      status,
      notes,
    });
  },

  /**
   * Publish letter (generate letter number)
   */
  async publish(id: string, letterDate: string, letterNumber?: string): Promise<ApiResponse<OutgoingLetter>> {
    return api.post<ApiResponse<OutgoingLetter>>(`${BASE_URL}/surat-keluar/${id}/publish`, {
      letterDate,
      letterNumber,
    });
  },

  /**
   * Delete outgoing letter
   */
  async delete(id: string): Promise<ApiResponse<{ message: string }>> {
    return api.delete<ApiResponse<{ message: string }>>(`${BASE_URL}/surat-keluar/${id}`);
  },

  /**
   * Get statistics
   */
  async getStatistics(): Promise<ApiResponse<LetterStatistics['outgoingLetters']>> {
    return api.get<ApiResponse<LetterStatistics['outgoingLetters']>>(`${BASE_URL}/surat-keluar/statistics`);
  },
};

// ============================================
// DISPOSITION / DISPOSISI
// ============================================

export const disposisiService = {
  /**
   * List dispositions
   */
  async list(filters?: DispositionFilters): Promise<PaginatedResponse<Disposition>> {
    const params = new URLSearchParams();
    if (filters?.incomingLetterId) params.append('incomingLetterId', filters.incomingLetterId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    params.append('page', String(filters?.page || 1));
    params.append('limit', String(filters?.limit || 20));

    const url = `${BASE_URL}/disposisi${params.toString() ? `?${params}` : ''}`;
    return api.get<PaginatedResponse<Disposition>>(url);
  },

  /**
   * Get disposition by ID
   */
  async getById(id: string): Promise<ApiResponse<Disposition>> {
    return api.get<ApiResponse<Disposition>>(`${BASE_URL}/disposisi/${id}`);
  },

  /**
   * Get disposition chain for incoming letter
   */
  async getChain(incomingLetterId: string): Promise<ApiResponse<Disposition[]>> {
    return api.get<ApiResponse<Disposition[]>>(`${BASE_URL}/disposisi/letter/${incomingLetterId}/chain`);
  },

  /**
   * Create disposition
   */
  async create(data: CreateDispositionDto): Promise<ApiResponse<Disposition>> {
    return api.post<ApiResponse<Disposition>>(`${BASE_URL}/disposisi`, data);
  },

  /**
   * Update disposition status
   */
  async update(id: string, status: string, notes?: string): Promise<ApiResponse<Disposition>> {
    return api.patch<ApiResponse<Disposition>>(`${BASE_URL}/disposisi/${id}`, {
      status,
      notes,
    });
  },

  /**
   * Delete disposition
   */
  async delete(id: string): Promise<ApiResponse<{ message: string }>> {
    return api.delete<ApiResponse<{ message: string }>>(`${BASE_URL}/disposisi/${id}`);
  },

  /**
   * Get pending count for current user
   */
  async getPendingCount(): Promise<ApiResponse<{ count: number }>> {
    return api.get<ApiResponse<{ count: number }>>(`${BASE_URL}/disposisi/pending/count`);
  },
};

// ============================================
// TEMPLATE & LETTERHEAD
// ============================================

export const templateService = {
  // Categories
  async listCategories(isActive?: boolean): Promise<PaginatedResponse<LetterCategory>> {
    const params = isActive !== undefined ? `?isActive=${isActive}` : '';
    return api.get<PaginatedResponse<LetterCategory>>(`${BASE_URL}/template/categories${params}`);
  },

  async createCategory(data: { code: string; name: string; description?: string; isActive?: boolean }): Promise<ApiResponse<LetterCategory>> {
    return api.post<ApiResponse<LetterCategory>>(`${BASE_URL}/template/categories`, data);
  },

  async updateCategory(id: string, data: { name?: string; description?: string; isActive?: boolean }): Promise<ApiResponse<LetterCategory>> {
    return api.patch<ApiResponse<LetterCategory>>(`${BASE_URL}/template/categories/${id}`, data);
  },

  // Letterheads
  async listLetterheads(isActive?: boolean): Promise<PaginatedResponse<Letterhead>> {
    const params = isActive !== undefined ? `?isActive=${isActive}` : '';
    return api.get<PaginatedResponse<Letterhead>>(`${BASE_URL}/template/letterheads${params}`);
  },

  async getDefaultLetterhead(): Promise<ApiResponse<Letterhead>> {
    return api.get<ApiResponse<Letterhead>>(`${BASE_URL}/template/letterheads/default`);
  },

  async createLetterhead(data: any, logo?: File): Promise<ApiResponse<Letterhead>> {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      const value = data[key as keyof typeof data];
      if (value !== undefined && value !== null) {
        if (value instanceof Date) {
          formData.append(key, value.toISOString());
        } else {
          formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        }
      }
    });
    if (logo) formData.append('logo', logo);

    return api.post<ApiResponse<Letterhead>>(`${BASE_URL}/template/letterheads`, formData);
  },

  async updateLetterhead(id: string, data: any, logo?: File): Promise<ApiResponse<Letterhead>> {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      const value = data[key as keyof typeof data];
      if (value !== undefined && value !== null) {
        if (value instanceof Date) {
          formData.append(key, value.toISOString());
        } else {
          formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        }
      }
    });
    if (logo) formData.append('logo', logo);

    return api.patch<ApiResponse<Letterhead>>(`${BASE_URL}/template/letterheads/${id}`, formData);
  },

  // Templates
  async listTemplates(type?: string, letterheadId?: string): Promise<PaginatedResponse<LetterTemplate>> {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (letterheadId) params.append('letterheadId', letterheadId);

    const url = `${BASE_URL}/template/templates${params.toString() ? `?${params}` : ''}`;
    return api.get<PaginatedResponse<LetterTemplate>>(url);
  },

  async getTemplateById(id: string): Promise<ApiResponse<LetterTemplate>> {
    return api.get<ApiResponse<LetterTemplate>>(`${BASE_URL}/template/templates/${id}`);
  },

  async createTemplate(data: any): Promise<ApiResponse<LetterTemplate>> {
    return api.post<ApiResponse<LetterTemplate>>(`${BASE_URL}/template/templates`, data);
  },

  async updateTemplate(id: string, data: any): Promise<ApiResponse<LetterTemplate>> {
    return api.patch<ApiResponse<LetterTemplate>>(`${BASE_URL}/template/templates/${id}`, data);
  },

  async deleteTemplate(id: string): Promise<ApiResponse<{ message: string }>> {
    return api.delete<ApiResponse<{ message: string }>>(`${BASE_URL}/template/templates/${id}`);
  },

  async renderTemplate(templateId: string, data: Record<string, any>): Promise<ApiResponse<{ content: string; template: LetterTemplate }>> {
    return api.post<ApiResponse<{ content: string; template: LetterTemplate }>>(`${BASE_URL}/template/templates/render`, {
      templateId,
      data,
    });
  },
};

// ============================================
// LETTER SUBJECT / PERIHAL SURAT
// ============================================

export const letterSubjectService = {
  async list(isActive?: boolean): Promise<PaginatedResponse<LetterSubject>> {
    const params = isActive !== undefined ? `?isActive=${isActive}` : '';
    return api.get<PaginatedResponse<LetterSubject>>(`${BASE_URL}/perihal${params}`);
  },

  async create(data: { code: string; name: string; description?: string; isActive?: boolean }): Promise<ApiResponse<LetterSubject>> {
    return api.post<ApiResponse<LetterSubject>>(`${BASE_URL}/perihal`, data);
  },

  async update(id: string, data: { code?: string; name?: string; description?: string; isActive?: boolean }): Promise<ApiResponse<LetterSubject>> {
    return api.patch<ApiResponse<LetterSubject>>(`${BASE_URL}/perihal/${id}`, data);
  },

  async delete(id: string): Promise<ApiResponse<{ message: string }>> {
    return api.delete<ApiResponse<{ message: string }>>(`${BASE_URL}/perihal/${id}`);
  },
};

// ============================================
// ARCHIVE / ARSIP
// ============================================

export const arsipService = {
  /**
   * List archives
   */
  async list(filters?: ArchiveFilters): Promise<PaginatedResponse<Archive>> {
    const params = new URLSearchParams();
    if (filters?.letterType) params.append('letterType', filters.letterType);
    if (filters?.categoryId) params.append('categoryId', filters.categoryId);
    if (filters?.archiveYear) params.append('archiveYear', String(filters.archiveYear));
    if (filters?.archiveMonth) params.append('archiveMonth', String(filters.archiveMonth));
    if (filters?.status) params.append('status', filters.status);
    if (filters?.protectionLevel) params.append('protectionLevel', filters.protectionLevel);
    if (filters?.search) params.append('search', filters.search);
    params.append('page', String(filters?.page || 1));
    params.append('limit', String(filters?.limit || 20));

    const url = `${BASE_URL}/arsip${params.toString() ? `?${params}` : ''}`;
    return api.get<PaginatedResponse<Archive>>(url);
  },

  /**
   * Get archive by ID
   */
  async getById(id: string): Promise<ApiResponse<Archive>> {
    return api.get<ApiResponse<Archive>>(`${BASE_URL}/arsip/${id}`);
  },

  /**
   * Archive incoming letter
   */
  async archiveIncomingLetter(incomingLetterId: string, data: any): Promise<ApiResponse<Archive>> {
    return api.post<ApiResponse<Archive>>(`${BASE_URL}/arsip/incoming/${incomingLetterId}`, data);
  },

  /**
   * Archive outgoing letter
   */
  async archiveOutgoingLetter(outgoingLetterId: string, data: any): Promise<ApiResponse<Archive>> {
    return api.post<ApiResponse<Archive>>(`${BASE_URL}/arsip/outgoing/${outgoingLetterId}`, data);
  },

  /**
   * Update archive
   */
  async update(id: string, data: any): Promise<ApiResponse<Archive>> {
    return api.patch<ApiResponse<Archive>>(`${BASE_URL}/arsip/${id}`, data);
  },

  /**
   * Delete archive (soft delete)
   */
  async delete(id: string): Promise<ApiResponse<{ message: string }>> {
    return api.delete<ApiResponse<{ message: string }>>(`${BASE_URL}/arsip/${id}`);
  },

  /**
   * Get statistics
   */
  async getStatistics(): Promise<ApiResponse<LetterStatistics['archives']>> {
    return api.get<ApiResponse<LetterStatistics['archives']>>(`${BASE_URL}/arsip/statistics`);
  },

  /**
   * Get archives by period
   */
  async getByPeriod(year: number, month?: number): Promise<ApiResponse<Archive[]>> {
    const url = month ? `${BASE_URL}/arsip/period/${year}/${month}` : `${BASE_URL}/arsip/period/${year}`;
    return api.get<ApiResponse<Archive[]>>(url);
  },

  /**
   * Get disposal candidates
   */
  async getDisposalCandidates(): Promise<ApiResponse<Archive[]>> {
    return api.get<ApiResponse<Archive[]>>(`${BASE_URL}/arsip/disposal/candidates`);
  },
};
