// Arsipari - Mail & Archive Management System Types

// ============================================
// ENUMS
// ============================================

export type LetterPriority = 'RENDAH' | 'NORMAL' | 'TINGGI' | 'URGENT';
export type LetterClassification = 'BIASA' | 'RAHASIA' | 'SANGAT_RAHASIA';
export type LetterNature = 'BIASA' | 'PENTING' | 'SEGERA';

export type IncomingLetterStatus = 'BARU' | 'DIPROSES' | 'DISPOSISI' | 'SELESAI' | 'ARSIP';
export type OutgoingLetterStatus = 'DRAFT' | 'REVIEW' | 'APPROVED' | 'REJECTED' | 'PUBLISHED' | 'ARSIP';

export type DispositionStatus = 'AWAITING' | 'READ' | 'COMPLETED';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type ArchiveStatus = 'AKTIF' | 'INAKTIF' | 'MUSNAH';
export type ArchiveType = 'MASUK' | 'KELUAR';
export type ProtectionLevel = 'OPEN' | 'RESTRICTED' | 'SECRET';

// ============================================
// LETTER CATEGORY
// ============================================

export interface LetterCategory {
  id: string;
  code: string; // e.g., SK, SURAT, UNDANGAN
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LetterSubject {
  id: string;
  code: string; // e.g., 005, UM
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// LETTERHEAD / KOP SURAT
// ============================================

export interface Letterhead {
  id: string;
  name: string; // Institution/unit name
  unit?: string; // Unit/organization name
  address?: string;
  website?: string;
  email?: string;
  phone?: string;
  logoUrl?: string;
  config?: Record<string, any>; // Custom layout configuration
  isActive: boolean;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// LETTER TEMPLATE
// ============================================

export interface LetterTemplate {
  id: string;
  name: string; // Template name
  code: string; // Template code
  type: string; // Letter type (UNDANGAN, EDARAN, SURAT_PERINTAH, etc)
  description?: string;
  letterheadId?: string;
  letterhead?: Letterhead;
  content: string; // Template content with variable placeholders
  variables: string[]; // Variable names: ["nomor", "tanggal", "tujuan", "perihal", "isi"]
  numberFormat?: string; // Number format, e.g., "NO/UNIT/BULAN/TAHUN"
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// INCOMING LETTER / SURAT MASUK
// ============================================

export interface IncomingLetter {
  id: string;
  letterNumber: string; // Letter number from sender
  letterDate: string; // Letter date
  receivedDate: string; // Received date
  sender: string; // Sender name
  senderAddress?: string;
  subject: string;
  categoryId?: string;
  category?: LetterCategory;
  classification?: LetterClassification;
  nature?: LetterNature;
  priority: LetterPriority;
  fileUrl?: string; // File URL (PDF/IMG)
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  status: IncomingLetterStatus;
  notes?: string;
  createdBy?: string;
  creator?: {
    id: string;
    fullName: string;
    profilePictureUrl?: string;
  };
  dispositions?: Disposition[];
  createdAt: string;
  updatedAt: string;
  finishedAt?: string;
  archivedAt?: string;
}

// Create/Update DTOs
export interface CreateIncomingLetterDto {
  letterNumber: string;
  letterDate: string;
  receivedDate: string;
  sender: string;
  senderAddress?: string;
  subject: string;
  categoryId?: string;
  classification?: LetterClassification;
  nature?: LetterNature;
  priority?: LetterPriority;
  file?: File;
  notes?: string;
}

export interface UpdateIncomingLetterDto {
  letterNumber?: string;
  letterDate?: string;
  receivedDate?: string;
  sender?: string;
  senderAddress?: string;
  subject?: string;
  categoryId?: string;
  classification?: LetterClassification;
  nature?: LetterNature;
  priority?: LetterPriority;
  file?: File;
  status?: IncomingLetterStatus;
  notes?: string;
}

// ============================================
// OUTGOING LETTER / SURAT KELUAR
// ============================================

export interface OutgoingLetter {
  id: string;
  letterNumber?: string; // Auto-generated on publish
  templateId?: string;
  template?: LetterTemplate;
  recipient: string; // Recipient
  recipientAddress?: string;
  subject: string;
  content: string; // Letter content
  attachment?: string;
  letterDate?: string; // Letter date
  categoryId?: string;
  category?: LetterCategory;
  subjectId?: string;
  letterSubject?: LetterSubject;
  classification?: LetterClassification;
  nature?: LetterNature;
  priority?: LetterPriority;
  status: OutgoingLetterStatus;
  fileUrl?: string; // Generated PDF
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  revision: number;
  notes?: string;
  createdBy?: string;
  creator?: {
    id: string;
    fullName: string;
    profilePictureUrl?: string;
  };
  approvals?: LetterApproval[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
  archivedAt?: string;
}

// Create/Update DTOs
export interface CreateOutgoingLetterDto {
  templateId?: string;
  recipient: string;
  recipientAddress?: string;
  subject: string;
  content: string;
  attachment?: string;
  letterDate?: string;
  categoryId?: string;
  classification?: LetterClassification;
  nature?: LetterNature;
  priority?: LetterPriority;
  notes?: string;
}

export interface UpdateOutgoingLetterDto {
  templateId?: string;
  recipient?: string;
  recipientAddress?: string;
  subject?: string;
  content?: string;
  attachment?: string;
  letterDate?: string;
  categoryId?: string;
  classification?: LetterClassification;
  nature?: LetterNature;
  priority?: LetterPriority;
  status?: OutgoingLetterStatus;
  notes?: string;
}

export interface SubmitApprovalDto {
  approvalUserIds: string[]; // List of user IDs for approval workflow
}

// ============================================
// DISPOSITION / DISPOSISI
// ============================================

export interface Disposition {
  id: string;
  incomingLetterId: string;
  incomingLetter?: IncomingLetter;
  fromUserId: string;
  fromUser?: {
    id: string;
    fullName: string;
    profilePictureUrl?: string;
  };
  toUserId: string;
  toUser?: {
    id: string;
    fullName: string;
    profilePictureUrl?: string;
  };
  instruction: string;
  notes?: string;
  status: DispositionStatus;
  readAt?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDispositionDto {
  incomingLetterId: string;
  toUserId: string;
  instruction: string;
  notes?: string;
}

export interface UpdateDispositionDto {
  status?: DispositionStatus;
  notes?: string;
}

// ============================================
// LETTER APPROVAL
// ============================================

export interface LetterApproval {
  id: string;
  outgoingLetterId: string;
  outgoingLetter?: OutgoingLetter;
  userId: string;
  user?: {
    id: string;
    fullName: string;
    profilePictureUrl?: string;
  };
  sequence: number; // Approval sequence order
  status: ApprovalStatus;
  notes?: string;
  approvalDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApprovalDto {
  userId: string;
  sequence: number;
}

export interface UpdateApprovalDto {
  status: ApprovalStatus;
  notes?: string;
}

// ============================================
// ARCHIVE / ARSIP
// ============================================

export interface Archive {
  id: string;
  archiveNumber: string; // Unique archive number
  letterType: ArchiveType;
  incomingLetterId?: string;
  incomingLetter?: IncomingLetter;
  outgoingLetterId?: string;
  outgoingLetter?: OutgoingLetter;
  letterNumber: string;
  subject: string;
  categoryId?: string;
  category?: LetterCategory;
  archiveYear: number;
  archiveMonth: number;
  location?: string; // Physical location: Cabinet, Shelf, Box
  protectionLevel?: ProtectionLevel;
  activeRetention?: number; // Years
  inactiveRetention?: number; // Years
  disposalDate?: string;
  status: ArchiveStatus;
  notes?: string;
  createdBy?: string;
  creator?: {
    id: string;
    fullName: string;
    profilePictureUrl?: string;
  };
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
}

export interface CreateArchiveDto {
  incomingLetterId?: string;
  outgoingLetterId?: string;
  categoryId?: string;
  archiveYear: number;
  archiveMonth: number;
  location?: string;
  protectionLevel?: ProtectionLevel;
  activeRetention?: number;
  inactiveRetention?: number;
  notes?: string;
}

// ============================================
// FILTER & LIST OPTIONS
// ============================================

export interface IncomingLetterFilters {
  status?: IncomingLetterStatus;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  priority?: LetterPriority;
  classification?: LetterClassification;
  search?: string; // Search by letter number, sender, subject
  page?: number;
  limit?: number;
}

export interface OutgoingLetterFilters {
  status?: OutgoingLetterStatus;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  templateId?: string;
  priority?: LetterPriority;
  search?: string; // Search by letter number, recipient, subject
  page?: number;
  limit?: number;
}

export interface DispositionFilters {
  incomingLetterId?: string;
  status?: DispositionStatus;
  startDate?: string;
  endDate?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ArchiveFilters {
  letterType?: ArchiveType;
  categoryId?: string;
  archiveYear?: number;
  archiveMonth?: number;
  status?: ArchiveStatus;
  protectionLevel?: ProtectionLevel;
  search?: string; // Search by archive number, letter number, subject
  page?: number;
  limit?: number;
}

// ============================================
// RESPONSE TYPES
// ============================================

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// ============================================
// LETTER STATISTICS
// ============================================

export interface LetterStatistics {
  incomingLetters: {
    total: number;
    baru: number;
    diproses: number;
    disposisi: number;
    selesai: number;
    arsip: number;
  };
  outgoingLetters: {
    total: number;
    draft: number;
    review: number;
    approved: number;
    published: number;
    arsip: number;
  };
  pendingApprovals: number;
  pendingDispositions: number;
  archives: {
    total: number;
    aktif: number;
    inaktif: number;
  };
}
