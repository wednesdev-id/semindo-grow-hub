import { api } from './api';

export interface Document {
    id: string;
    type: string;
    fileUrl: string;
    fileName: string;
    status: 'pending' | 'verified' | 'rejected';
    createdAt: string;
}

export const documentService = {
    async upload(file: File, type: string, number?: string) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        if (number) formData.append('number', number);

        const response = await api.post<{ data: Document }>('/documents', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    async list() {
        const response = await api.get<{ data: Document[] }>('/documents');
        return response.data;
    },

    async delete(id: string) {
        return api.delete(`/documents/${id}`);
    }
};
