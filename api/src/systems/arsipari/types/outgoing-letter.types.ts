// Outgoing Letter Types

export interface CreateOutgoingLetterDto {
  templateId?: string;
  recipient: string;
  recipientAddress?: string;
  subject: string;
  content: string;
  attachment?: string;
  letterDate?: Date;
  categoryId?: string;
  subjectId?: string;
  notes?: string;
  createdBy?: string;
}

export interface UpdateOutgoingLetterDto {
  templateId?: string;
  recipient?: string;
  recipientAddress?: string;
  subject?: string;
  content?: string;
  attachment?: string;
  letterDate?: Date;
  categoryId?: string;
  subjectId?: string;
  status?: string;
  notes?: string;
}

export interface OutgoingLetterFilters {
  status?: string;
  categoryId?: string;
  subjectId?: string;
  startDate?: Date;
  endDate?: Date;
  templateId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface SubmitApprovalDto {
  approvalUserIds: string[];
  notes?: string;
}

export interface ApproveLetterDto {
  status: 'APPROVED' | 'REJECTED';
  notes?: string;
}

export interface PublishLetterDto {
  letterDate: Date;
  letterNumber?: string; // Optional override
}
