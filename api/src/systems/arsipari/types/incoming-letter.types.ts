// Incoming Letter Types

export interface CreateIncomingLetterDto {
  letterNumber: string;
  letterDate: Date;
  receivedDate: Date;
  sender: string;
  senderAddress?: string;
  subject: string;
  categoryId?: string;
  classification?: string;
  nature?: string;
  priority?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  notes?: string;
  createdBy?: string;
}

export interface UpdateIncomingLetterDto {
  letterNumber?: string;
  letterDate?: Date;
  receivedDate?: Date;
  sender?: string;
  senderAddress?: string;
  subject?: string;
  categoryId?: string;
  classification?: string;
  nature?: string;
  priority?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  status?: string;
  notes?: string;
}

export interface IncomingLetterFilters {
  status?: string;
  categoryId?: string;
  startDate?: Date;
  endDate?: Date;
  priority?: string;
  classification?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface UpdateStatusDto {
  status: string;
  notes?: string;
}
