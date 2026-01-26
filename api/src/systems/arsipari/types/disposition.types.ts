// Disposition Types

export interface CreateDispositionDto {
  incomingLetterId: string;
  toUserId: string;
  instruction: string;
  notes?: string;
}

export interface UpdateDispositionDto {
  status?: string;
  notes?: string;
}

export interface DispositionFilters {
  incomingLetterId?: string;
  fromUserId?: string;
  toUserId?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}
