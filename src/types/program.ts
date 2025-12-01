import { User } from './auth';

export interface Program {
    id: string;
    title: string;
    description: string;
    type: 'incubator' | 'accelerator' | 'training';
    status: 'draft' | 'active' | 'completed';
    bannerUrl?: string;
    startDate: string;
    endDate: string;
    organizerId: string;
    createdAt: string;
    updatedAt: string;
    organizer?: User;
    batches?: ProgramBatch[];
}

export interface ProgramBatch {
    id: string;
    programId: string;
    name: string;
    startDate: string;
    endDate: string;
    maxParticipants: number;
    createdAt: string;
    updatedAt: string;
    program?: Program;
    participants?: ProgramParticipant[];
    _count?: {
        participants: number;
    };
}

export interface ProgramParticipant {
    id: string;
    batchId: string;
    userId: string;
    status: 'applied' | 'accepted' | 'rejected' | 'graduated' | 'dropped';
    joinedAt: string;
    notes?: string;
    user?: User;
    batch?: ProgramBatch;
}
